import express from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from 'express-openapi-validator';
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Clave secreta utilizada para firmar y verificar los JSON Web Tokens.
 *
 * @type {string}
 * @todo Migrar a variable de entorno antes de desplegar en producción.
 */
const SECRET_KEY = "mi_super_secreto";

const app = express();
const port = 3000;

/**
 * Contrato OpenAPI cargado desde el archivo YAML.
 * Actúa como fuente de verdad para la validación automática de requests,
 * responses y seguridad, y como fuente de la documentación Swagger UI.
 *
 * @type {object}
 */
const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

/**
 * Middleware de validación automática contra el contrato OpenAPI.
 *
 * - validateRequests: valida el body, path params y headers antes del handler.
 * - validateResponses: valida la respuesta antes de enviarla al cliente.
 * - validateSecurity: intercepta peticiones a rutas protegidas y verifica el JWT.
 * - ignorePaths: excluye las rutas de Swagger UI de la validación.
 */
app.use(OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/docs/,
    validateSecurity: {
        handlers: {
            /**
             * Handler de seguridad para el esquema `JWT` definido en el contrato.
             * Se invoca automáticamente en cada petición a un endpoint con seguridad JWT activa.
             *
             * @param {import('express').Request} req - Objeto de petición de Express.
             * @param {string[]} scopes - Scopes requeridos por la operación (no utilizados).
             * @param {object} schema - Definición del esquema de seguridad desde el contrato.
             * @returns {true} Si el token es válido.
             * @throws {{ status: number, message: string }} Si el token está ausente o es inválido.
             */
            JWT: (req, scopes, schema) => {
                const authHeader = req.headers.authorization;
                if (!authHeader) throw { status: 401, message: "Token no provisto" };
                const token = authHeader.split(" ")[1];
                try {
                    jwt.verify(token, SECRET_KEY);
                    return true;
                } catch (e) {
                    throw { status: 401, message: "Token inválido" };
                }
            }
        }
    }
}));

/**
 * Middleware global de manejo de errores.
 * Captura cualquier error lanzado por el validador o por los route handlers
 * y lo serializa como JSON con el código de estado correspondiente.
 *
 * @param {object} err - Objeto de error (puede provenir del validador OpenAPI o del código).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        code: err.code || "INTERNAL_ERROR",
        errors: err.errors
    });
});

/**
 * GET /v1/ — Página de bienvenida.
 * Devuelve HTML de bienvenida al ingresar a la raíz del servidor v1.
 *
 * @route GET /v1/
 */
app.get("/v1/", (req, res) => {
    res.send(`
         <h1>Welcome to my API</h1>
         `)
})


/**
 * GET /v1/hello — Endpoint de salud en versión 1.
 * Devuelve un mensaje JSON simple.
 *
 * @route GET /v1/hello
 * @returns {{ message: string }}
 */
app.get("/v1/hello", (req, res) => {
    res.json({ message: "Hello World" });
});

/**
 * GET /v2/hello — Endpoint de salud en versión 2.
 * Devuelve un mensaje JSON con la versión y la hora actual del servidor.
 *
 * @route GET /v2/hello
 * @returns {{ message: string, version: string, time: string }}
 */
app.get("/v2/hello", (req, res) => {
    res.json({ 
        message: "Hello World V2",
        version: "v2",
        time: new Date().toISOString() 
     });
});

/**
 * Base de datos en memoria de usuarios.
 * Persiste solo durante la vida del proceso Node.js.
 *
 * Cada usuario almacena su `password` internamente, pero ésta se omite
 * en todas las respuestas mediante destructuring.
 *
 * @type {Array<{ id: string, name: string, age: number, email: string, password: string }>}
 */
const users = [
    {
    id: "6d4b4df7-cb9c-4f7b-b1d2-6c2fdd9c7d3b",
    name: "Juan Pérez",
    age: 24,
    email: "juan.perez@example.com",
    password: "123456"
  },
  {
    id: "1a2e8c66-90b4-468f-ae6d-f64b80a6a8c4",
    name: "María Gómez",
    age: 31,
    email: "maria.gomez@example.com",
    password: "123456"
  },
  {
    id: "f8a4d63d-28df-4d89-a8e5-4ec3d9a9b2f1",
    name: "Carlos Rodríguez",
    age: 42,
    email: "carlos.rodriguez@example.com",
    password: "123456"
  },
  {
    id: "8f7e5c1d-9b8a-41d6-82b4-3bfcfbde7e54",
    name: "Laura Martínez",
    age: 27,
    email: "laura.martinez@example.com",
    password: "123456"
  },
  {
    id: "b3d91d4f-1d4c-4df9-b8b0-7d6d5d8d98e2",
    name: "Andrés Ramírez",
    age: 36,
    email: "andres.ramirez@example.com",
    password: "123456"
  },
];

/**
 * Base de datos en memoria de productos.
 * Persiste solo durante la vida del proceso Node.js.
 *
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   category: string,
 *   price: number,
 *   tags: string[],
 *   inStock: boolean,
 *   specifications?: Record<string, string>,
 *   ratings: Array<{ score: number, comment: string }>
 * }>}
 */
const products = [
    {
        id: "d3b07384-d113-49c3-a5f1-39d20c5b5212",
        name: "Teclado Mecánico",
        description: "Teclado mecánico RGB con switches switch azul",
        category: "Electrónica",
        price: 59.99,
        tags: ["teclado", "rgb", "gamer"],
        inStock: true,
        specifications: {
            idioma: "Español",
            conexion: "USB"
        },
        ratings: []
    },
    {
        id: "e5a6b8c9-21d3-4e8a-bf90-1c2d3e4f5a6b",
        name: "Camiseta Deportiva",
        description: "Camiseta dry-fit para entrenamiento",
        category: "Ropa",
        price: 20,
        tags: ["deporte", "ropa", "fit"],
        inStock: true,
        specifications: {
            talla: "M",
            material: "Poliéster"
        },
        ratings: [
            {
                score: 5,
                comment: "Excelente calidad y comodidad."
            }
        ]
    }
];

/**
 * POST /users — Crea un nuevo usuario.
 * La password se almacena internamente pero se omite en la respuesta.
 *
 * @route POST /users
 * @body {CreateUserRequest} name, age, email, password
 * @returns {User} 201 — El usuario creado sin el campo `password`.
 */
app.post("/users", (req, res) => {
    const { name, age, email, password } = req.body;
    const newUser = {
        id: crypto.randomUUID(),
        name,
        age,
        email,
        password
    };
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

/**
 * GET /users/:id — Obtiene un usuario por su UUID.
 *
 * @route GET /users/:id
 * @param {string} req.params.id - UUID del usuario.
 * @returns {User} 200 — El usuario encontrado sin el campo `password`.
 * @returns {ErrorResponse} 404 — Si el usuario no existe.
 */
app.get("/users/:id", (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({
            message: "Usuario no encontrado",
            code: "USER_NOT_FOUND"
        });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

/**
 * PATCH /users/:id — Actualiza parcialmente un usuario.
 * Solo los campos enviados en el body se modifican; el resto se conserva.
 *
 * @route PATCH /users/:id
 * @param {string} req.params.id - UUID del usuario.
 * @body {UpdateUserRequest} Campos opcionales: name, age, email.
 * @returns {User} 200 — El usuario actualizado sin el campo `password`.
 * @returns {ErrorResponse} 404 — Si el usuario no existe.
 */
app.patch("/users/:id", (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({
            message: "Usuario no encontrado",
            code: "USER_NOT_FOUND"
        });
    }
    
    const updates = req.body;
    const currentUser = users[userIndex];
    
    const updatedUser = {
        ...currentUser,
        ...updates
    };
    
    users[userIndex] = updatedUser;
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
});

/**
 * POST /auth/login — Autentica un usuario y devuelve un JWT.
 * Este endpoint es público: no requiere autenticación previa.
 *
 * @route POST /auth/login
 * @body {LoginRequest} email, password
 * @returns {LoginResponse} 200 — El token JWT firmado, con expiración de 1 hora.
 * @returns {ErrorResponse} 401 — Si las credenciales son incorrectas.
 */
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            message: "Email o contraseña incorrectos",
            code: "UNAUTHORIZED"
        });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

/**
 * GET /products — Devuelve todos los productos.
 *
 * @route GET /products
 * @returns {Product[]} 200 — Array con todos los productos en memoria.
 */
app.get("/products", (req, res) => {
    res.json(products);
});

/**
 * POST /products — Crea un nuevo producto.
 * El campo `ratings` se inicializa como array vacío si no se proporciona.
 *
 * @route POST /products
 * @body {CreateProductRequest} name, category, price, inStock y campos opcionales.
 * @returns {Product} 201 — El producto creado con su ID generado.
 */
app.post("/products", (req, res) => {
    const productData = req.body;
    const newProduct = {
        id: crypto.randomUUID(),
        ...productData,
        ratings: productData.ratings || []
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * GET /products/:id — Obtiene un producto por su UUID.
 *
 * @route GET /products/:id
 * @param {string} req.params.id - UUID del producto.
 * @returns {Product} 200 — El producto encontrado.
 * @returns {ErrorResponse} 404 — Si el producto no existe.
 */
app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({
            message: "Producto no encontrado",
            code: "PRODUCT_NOT_FOUND"
        });
    }
    res.json(product);
});

/**
 * PUT /products/:id — Reemplaza completamente un producto existente.
 * El campo `ratings` se conserva del producto anterior si no se envía en el body.
 *
 * @route PUT /products/:id
 * @param {string} req.params.id - UUID del producto.
 * @body {CreateProductRequest} Todos los campos requeridos del producto.
 * @returns {Product} 200 — El producto reemplazado.
 * @returns {ErrorResponse} 404 — Si el producto no existe.
 */
app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({
            message: "Producto no encontrado",
            code: "PRODUCT_NOT_FOUND"
        });
    }

    const replacementData = req.body;

    const replacedProduct = {
        id,
        ...replacementData,
        ratings: replacementData.ratings || products[productIndex].ratings || []
    };

    products[productIndex] = replacedProduct;
    res.json(replacedProduct);
});

/**
 * PATCH /products/:id — Actualiza parcialmente un producto.
 * Solo los campos enviados en el body se modifican; el resto se conserva.
 *
 * @route PATCH /products/:id
 * @param {string} req.params.id - UUID del producto.
 * @body {UpdateProductRequest} Campos opcionales del producto.
 * @returns {Product} 200 — El producto actualizado.
 * @returns {ErrorResponse} 404 — Si el producto no existe.
 */
app.patch("/products/:id", (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({
            message: "Producto no encontrado",
            code: "PRODUCT_NOT_FOUND"
        });
    }

    const updates = req.body;
    const currentProduct = products[productIndex];

    const updatedProduct = {
        ...currentProduct,
        ...updates
    };

    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
});

/**
 * DELETE /products/:id — Elimina un producto.
 *
 * @route DELETE /products/:id
 * @param {string} req.params.id - UUID del producto.
 * @returns {void} 204 — Sin contenido si la eliminación fue exitosa.
 * @returns {ErrorResponse} 404 — Si el producto no existe.
 */
app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({
            message: "Producto no encontrado",
            code: "PRODUCT_NOT_FOUND"
        });
    }

    products.splice(productIndex, 1);
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}/v1`);
    console.log(`Servidor corriendo en http://localhost:${port}/v2`);
    console.log(`Swagger: http://localhost:${port}/docs`);
});