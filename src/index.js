import express from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from 'express-openapi-validator';

const app = express();
const port = 3000;

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json())

app.use(OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/docs/
}));

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        code: err.code || "INTERNAL_ERROR",
        errors: err.errors
    });
});

app.get("/", (req, res) => {
    res.send(`
        <h1>Welcome to my API</h1>
        `)
})


app.get("/hello", (req, res) => {
    res.json({ message: "Hello World" });
});

// In-memory users database
const users = [
    {
    id: "6d4b4df7-cb9c-4f7b-b1d2-6c2fdd9c7d3b",
    name: "Juan Pérez",
    age: 24,
    email: "juan.perez@example.com",
  },
  {
    id: "1a2e8c66-90b4-468f-ae6d-f64b80a6a8c4",
    name: "María Gómez",
    age: 31,
    email: "maria.gomez@example.com",
  },
  {
    id: "f8a4d63d-28df-4d89-a8e5-4ec3d9a9b2f1",
    name: "Carlos Rodríguez",
    age: 42,
    email: "carlos.rodriguez@example.com",
  },
  {
    id: "8f7e5c1d-9b8a-41d6-82b4-3bfcfbde7e54",
    name: "Laura Martínez",
    age: 27,
    email: "laura.martinez@example.com",
  },
  {
    id: "b3d91d4f-1d4c-4df9-b8b0-7d6d5d8d98e2",
    name: "Andrés Ramírez",
    age: 36,
    email: "andres.ramirez@example.com",
  },
];

app.post("/users", (req, res) => {
    const { name, age, email } = req.body;
    const newUser = {
        id: crypto.randomUUID(),
        name,
        age,
        email
    };
    users.push(newUser);
    res.status(201).json(newUser);
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
    res.json(user);
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
    res.json(updatedUser);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});