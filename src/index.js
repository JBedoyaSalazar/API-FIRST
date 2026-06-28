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

app.post("/users", (req, res) => {
    const { name, age, email } = req.body
    const newUser = {
        id: crypto.randomUUID(),
        name,
        age,
        email
    }
    res.status(201).json(newUser)
})

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});