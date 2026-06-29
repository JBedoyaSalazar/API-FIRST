import express from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from 'express-openapi-validator';
import crypto from "crypto";
import jwt from "jsonwebtoken";

const SECRET_KEY = "mi_super_secreto";

const app = express();
const port = 3000;

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

app.use(OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/docs/,
    validateSecurity: {
        handlers: {
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

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        code: err.code || "INTERNAL_ERROR",
        errors: err.errors
    });
});

app.get("/v1/", (req, res) => {
    res.send(`
         <h1>Welcome to my API</h1>
         `)
})


app.get("/v1/hello", (req, res) => {
    res.json({ message: "Hello World" });
});

app.get("/v2/hello", (req, res) => {
    res.json({ 
        message: "Hello World V2",
        version: "v2",
        time: new Date().toISOString() 
     });
});

// In-memory users database
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

// In-memory products database
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

app.get("/products", (req, res) => {
    res.json(products);
});

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