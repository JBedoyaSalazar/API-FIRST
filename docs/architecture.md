# Arquitectura del sistema

Este documento describe la arquitectura real del proyecto FAKEAPI STORE, tal como está implementada actualmente.

---

## Visión general

El proyecto es una API REST de propósito educativo que implementa la metodología **API First**. Toda la lógica del servidor reside en un único proceso Node.js utilizando el framework Express 5. La capa de datos es en memoria (arrays JavaScript), sin dependencia de base de datos externa.

La arquitectura sigue un modelo de tres capas lógicas:

1. **Contrato** (`openapi.yaml`): define todas las reglas antes de que exista código.
2. **Validación** (`express-openapi-validator`): garantiza que el tráfico real cumpla el contrato.
3. **Implementación** (`src/index.js`): responde las peticiones válidas con la lógica de negocio.

---

## Organización de carpetas

```
API FIRST/
├── src/
│   └── index.js          # Punto de entrada: servidor, middlewares y endpoints
├── openapi.yaml          # Contrato OpenAPI 3.1.1 (fuente de verdad absoluta)
├── docs/                 # Documentación técnica del proyecto
├── package.json          # Dependencias y scripts
└── .gitignore
```

El proyecto mantiene una estructura deliberadamente plana. Al ser un proyecto de aprendizaje con dos recursos principales (usuarios y productos), toda la lógica coexiste en `src/index.js`. No existen subcarpetas de controllers, routes o models porque la arquitectura no lo requiere en este estadio.

---

## Flujo de una petición HTTP

```
Cliente HTTP (curl / Swagger UI / Postman)
  │
  ▼
Express: middleware de parsing JSON
  │
  ▼
express-openapi-validator: validateSecurity (handler JWT)
  │  ─ Si el endpoint requiere JWT y el token es inválido → 401
  │  ─ Si el endpoint es público (security: []) → continúa
  │
  ▼
express-openapi-validator: validateRequests
  │  ─ Valida el body, path params y headers contra el contrato
  │  ─ Si la petición no cumple el esquema → 400
  │
  ▼
Route handler (en src/index.js)
  │  ─ Ejecuta la lógica de negocio
  │  ─ Lee / escribe en los arrays en memoria
  │
  ▼
express-openapi-validator: validateResponses
  │  ─ Valida que la respuesta cumpla el esquema definido en el contrato
  │  ─ Si la respuesta no cumple → error interno
  │
  ▼
Cliente HTTP recibe la respuesta
```

El error handler global de Express (`app.use((err, req, res, next) => {...})`) captura cualquier error lanzado por el validador o por la lógica de negocio y lo serializa como JSON.

---

## Organización del contrato OpenAPI

El archivo `openapi.yaml` está estructurado en las siguientes secciones:

| Sección | Contenido |
|---|---|
| `info` | Título, versión, descripción, contacto, licencia |
| `servers` | URLs base: `/v1` y `/v2` |
| `tags` | Agrupaciones: `users`, `products` |
| `components.schemas` | Todos los esquemas de datos reutilizables |
| `components.securitySchemes` | Esquema `JWT` (Bearer HTTP) |
| `security` | Seguridad global aplicada a todos los endpoints |
| `paths` | Definición de cada endpoint con sus operaciones |

---

## Reutilización mediante `$ref`

El principio DRY se aplica directamente en el contrato. Los esquemas se definen una sola vez en `components.schemas` y se referencian desde múltiples operaciones usando `$ref`.

**Ejemplo de cadena de referencia:**

```
POST /products → requestBody → $ref: CreateProductRequest
                                      │
                                      └── category → $ref: ProductCategory
                                      └── ratings[]  → $ref: Rating

GET /products/{id} → response 200 → $ref: Product
                                          │
                                          └── category → $ref: ProductCategory
                                          └── ratings[]  → $ref: Rating
```

Esto garantiza que si se modifica `ProductCategory`, el cambio se propaga a todas las operaciones que la referencian, sin duplicación.

---

## Separación de responsabilidades

| Responsabilidad | Capa | Archivo |
|---|---|---|
| Definir estructura y reglas | Contrato | `openapi.yaml` |
| Validar requests entrantes | Middleware | `express-openapi-validator` |
| Validar responses salientes | Middleware | `express-openapi-validator` |
| Autenticar tokens JWT | Middleware / security handler | `src/index.js` |
| Ejecutar lógica de negocio | Route handlers | `src/index.js` |
| Persistir datos | Datos en memoria | `src/index.js` (arrays) |

---

## Estrategia de validaciones

Las validaciones no se implementan manualmente en el código. Se delegan completamente al middleware `express-openapi-validator`, que lee el contrato y aplica las reglas automáticamente.

Las validaciones activas incluyen:

- **validateRequests: true** — Valida bodies, path params y formatos antes de llegar al handler.
- **validateResponses: true** — Valida la respuesta JSON contra el esquema antes de enviarla al cliente.
- **validateSecurity** — Intercepta peticiones a rutas protegidas y verifica el token JWT.

El único punto donde no se aplica validación del validador es la ruta `/docs`, excluida explícitamente mediante `ignorePaths: /.*\/docs/`.

---

## Principios arquitectónicos observados

- **API First**: el contrato se diseña antes que el código.
- **Contrato como fuente de verdad**: el backend no puede devolver algo que el contrato no haya definido.
- **Validación en middleware**: las reglas de negocio de estructura de datos no se duplican en los handlers.
- **DRY en el contrato**: los esquemas se definen una vez y se referencian múltiples veces.
- **Seguridad global por defecto**: el bloque `security: [{ JWT: [] }]` a nivel raíz protege todos los endpoints, y los endpoints públicos optan explícitamente por salir de ella con `security: []`.

---

## Decisiones de diseño observadas

- **ESM nativo**: el proyecto usa `"type": "module"` en `package.json`, por lo que todos los imports son ES Modules (`import` / `export`).
- **Un solo archivo de servidor**: en este estadio educativo, toda la lógica coexiste en `src/index.js` sin fragmentación prematura.
- **`node --watch` como hot reload**: se usa el flag nativo de Node.js en lugar de `nodemon`, eliminando una dependencia de desarrollo.
- **Password en texto plano**: los passwords de los usuarios en memoria no están hasheados. Esta es una limitación del entorno de mock, documentada en `docs/roadmap.md`.
- **La password se omite en las respuestas**: aunque los usuarios se almacenan con `password`, todos los route handlers de usuarios aplican destructuring para excluir ese campo antes de responder.
