import express from "express";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = 3000;

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get("/hello", (req, res) => {
    res.json({ message: "Hello World" });
});

app.get("/", (req, res) => {
    res.send(`
        <h1>Welcome to my API</h1>
        `)
})

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});