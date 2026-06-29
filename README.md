# FAKEAPI STORE

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=flat-square)](https://github.com/JBedoyaSalazar/API-FIRST)
[![Versión](https://img.shields.io/badge/versión-1.2.3-blue?style=flat-square)](https://github.com/JBedoyaSalazar/API-FIRST)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1.1-green?style=flat-square&logo=swagger)](./openapi.yaml)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2.1-black?style=flat-square&logo=express)](https://expressjs.com)
[![Licencia](https://img.shields.io/badge/licencia-MIT-lightgrey?style=flat-square)](LICENSE)

API REST construida con la metodología **API First**, donde el contrato OpenAPI actúa como única fuente de verdad. Proyecto educativo del curso de Backend con Node.js de Platzi.

---

## Objetivos

- Aprender y aplicar la metodología API First en un proyecto real.
- Implementar un servidor Express que respete estrictamente un contrato OpenAPI 3.1.
- Validar requests y responses automáticamente usando `express-openapi-validator`.
- Diseñar contratos reutilizables con `$ref` y `components`.
- Implementar autenticación mediante JSON Web Tokens (JWT).

---

## Filosofía API First

En este proyecto, el archivo `openapi.yaml` se diseña **antes** que el código. El contrato define rutas, esquemas, validaciones y respuestas. El backend implementa exactamente lo que el contrato especifica, sin excepciones.

> El contrato no sigue al código. El código sigue al contrato.

Consulta [`docs/api-first.md`](./docs/api-first.md) para entender en profundidad esta filosofía.

---

## Tecnologías

| Herramienta | Versión | Rol |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript (ESM) |
| Express | 5.2.1 | Framework HTTP |
| express-openapi-validator | 5.6.2 | Validación automática del contrato |
| swagger-ui-express | 5.0.1 | Documentación interactiva en `/docs` |
| jsonwebtoken | 9.0.3 | Autenticación JWT |
| yamljs | 0.3.0 | Carga del contrato OpenAPI |

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JBedoyaSalazar/API-FIRST.git
cd API-FIRST

# Instalar dependencias
npm install
```

---

## Ejecución

```bash
# Modo desarrollo (con hot reload nativo de Node.js --watch)
npm run dev

# Modo producción
npm start
```

El servidor escucha en el puerto `3000`.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo con `--watch` |
| `npm start` | Inicia el servidor en modo producción |

---

## Estructura del proyecto

```
API FIRST/
├── src/
│   └── index.js          # Servidor Express y todos los endpoints
├── openapi.yaml          # Contrato OpenAPI 3.1.1 (fuente de verdad)
├── docs/
│   ├── architecture.md   # Arquitectura del sistema
│   ├── api-first.md      # Metodología API First
│   ├── technical-findings.md  # Investigaciones técnicas
│   ├── roadmap.md        # Estado y evolución del proyecto
│   └── decisions.md      # Registro de decisiones arquitectónicas
├── package.json
├── .gitignore
└── README.md
```

---

## Recursos implementados

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/login` | Obtiene un JWT válido | Pública |

### Usuarios

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/users` | Crea un usuario | JWT |
| GET | `/users/{id}` | Obtiene un usuario por ID | JWT |
| PATCH | `/users/{id}` | Actualiza parcialmente un usuario | JWT |

### Productos

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/products` | Listado de todos los productos | JWT |
| POST | `/products` | Crea un producto | JWT |
| GET | `/products/{id}` | Obtiene un producto por ID | JWT |
| PUT | `/products/{id}` | Reemplaza completamente un producto | JWT |
| PATCH | `/products/{id}` | Actualiza parcialmente un producto | JWT |
| DELETE | `/products/{id}` | Elimina un producto | JWT |

### Utilitarios

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/` | Página de bienvenida HTML | Pública |
| GET | `/hello` | Respuesta de salud JSON | Pública |

Documentación interactiva disponible en [`http://localhost:3000/docs`](http://localhost:3000/docs).

---

## Documentación

| Documento | Descripción |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | Arquitectura del sistema, capas y flujo de petición |
| [`docs/api-first.md`](./docs/api-first.md) | Metodología API First aplicada en el proyecto |
| [`docs/technical-findings.md`](./docs/technical-findings.md) | Investigaciones y hallazgos técnicos |
| [`docs/roadmap.md`](./docs/roadmap.md) | Estado actual y próximos objetivos |
| [`docs/decisions.md`](./docs/decisions.md) | Registro de decisiones arquitectónicas |

---

## Roadmap resumido

- [x] Contrato OpenAPI 3.1 con componentes reutilizables
- [x] Validación automática de requests y responses
- [x] Documentación interactiva con Swagger UI
- [x] CRUD de usuarios y productos en memoria
- [x] Autenticación con JWT
- [ ] Persistencia en base de datos real
- [ ] Pruebas automatizadas
- [ ] Variables de entorno con `.env`
- [ ] Despliegue en producción

Consulta [`docs/roadmap.md`](./docs/roadmap.md) para el detalle completo.

---

## Contribución

Este proyecto tiene un propósito educativo. Si deseas contribuir:

1. Haz un fork del repositorio.
2. Crea una rama descriptiva: `git checkout -b feat/nombre-de-la-mejora`.
3. Realiza tus cambios respetando el contrato OpenAPI.
4. Abre un Pull Request describiendo los cambios.

Cualquier modificación al backend debe estar precedida de una actualización al contrato `openapi.yaml`.

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**Autor:** Jefred Bedoya — [@JBedoyaSalazar](https://github.com/JBedoyaSalazar)
