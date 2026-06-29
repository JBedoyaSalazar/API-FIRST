# API First: metodología y aplicación en este proyecto

Este documento explica en profundidad qué es la metodología API First y cómo fue aplicada durante el desarrollo de FAKEAPI STORE.

---

## ¿Qué significa API First?

API First es una estrategia de desarrollo en la que el contrato de la API se diseña y se acuerda **antes** de escribir cualquier línea de código backend o frontend.

En la práctica, esto significa que:

1. Se redacta el archivo `openapi.yaml` describiendo todos los recursos, operaciones, esquemas de datos y reglas de validación.
2. Ese contrato es revisado y validado como si fuera código de producción.
3. Solo después de que el contrato está estable, se implementa el servidor.

El resultado es que el contrato no describe lo que el código hace. El código implementa lo que el contrato dice.

---

## Por qué el contrato es la fuente de verdad

En un desarrollo tradicional, la documentación de la API suele generarse a partir del código (por ejemplo, con anotaciones o reflexión). Esto produce documentación que siempre va por detrás de la implementación, con el riesgo de que divergen.

En este proyecto ocurre lo opuesto:

- El archivo `openapi.yaml` define qué rutas existen, qué campos son obligatorios, qué formatos se aceptan y qué respuestas son válidas.
- El middleware `express-openapi-validator` lee ese contrato en tiempo de ejecución y bloquea cualquier petición o respuesta que no lo cumpla.
- Si el código devuelve un campo que el contrato no define, el validador lo detecta y falla en la respuesta.

Esto convierte al contrato en la única fuente autorizada de información sobre la API.

---

## Cómo evoluciona el contrato

Cualquier cambio en la API comienza siempre por una modificación en `openapi.yaml`. El flujo correcto es:

```
1. Modificar el contrato openapi.yaml
2. Verificar que el contrato es válido (Swagger UI, lint)
3. Implementar o ajustar el código en src/index.js
4. Comprobar que el validador no rechaza las peticiones ni las respuestas
```

Este flujo garantiza que el contrato nunca quede desactualizado respecto al código.

---

## Organización del archivo OpenAPI

El contrato `openapi.yaml` sigue una estructura jerárquica clara:

```
openapi: 3.1.1
info:          ← Metadatos: título, versión, contacto, licencia
servers:       ← URLs base del servidor (v1, v2)
tags:          ← Agrupaciones lógicas de operaciones
security:      ← Seguridad global (JWT obligatorio por defecto)
components:
  schemas:     ← Todos los modelos de datos reutilizables
  securitySchemes: ← Definición del esquema de autenticación
paths:         ← Definición de cada endpoint y operación
```

Esta estructura sigue las convenciones estándar de OpenAPI 3.1 y facilita la navegación del contrato.

---

## Reutilización de componentes

El contrato aplica el principio DRY mediante `$ref`. En lugar de definir la estructura de un producto en cada operación que lo involucra, se define una sola vez en `components.schemas.Product` y se referencia desde todos los endpoints que lo necesitan.

Los schemas definidos en `components.schemas` son:

| Schema | Propósito |
|---|---|
| `User` | Estructura de un usuario en respuestas |
| `CreateUserRequest` | Campos requeridos para crear un usuario |
| `UpdateUserRequest` | Campos opcionales para actualización parcial de usuario |
| `LoginRequest` | Credenciales para obtener un JWT |
| `LoginResponse` | Respuesta con el token JWT |
| `Product` | Estructura completa de un producto |
| `CreateProductRequest` | Campos para crear un producto |
| `UpdateProductRequest` | Campos opcionales para actualización parcial de producto |
| `ProductCategory` | Enumeración de categorías válidas |
| `Rating` | Estructura de una valoración de producto |
| `ErrorResponse` | Estructura estándar de errores |
| `RootResponse` | Tipo de la respuesta de bienvenida |
| `HelloResponse` | Tipo de la respuesta de salud |

Los schemas compuestos como `Product` y `CreateProductRequest` referencian a su vez `ProductCategory` y `Rating`, creando una jerarquía de componentes anidados.

---

## Beneficios obtenidos en este proyecto

- **Contrato como documentación viva**: Swagger UI consume directamente el `openapi.yaml` y siempre muestra el estado real de la API.
- **Validación automática sin código repetido**: las reglas como `minLength`, `format: email`, `exclusiveMinimum` o `enum` se declaran una vez en el contrato y se aplican en cada petición sin duplicarlas en los handlers.
- **Detección temprana de errores**: la validación de respuestas (`validateResponses: true`) detecta inconsistencias entre el código y el contrato antes de que el cliente las sufra.
- **Ejemplos realistas en la documentación**: el uso de `example` y `examples` en el contrato enriquece Swagger UI con datos coherentes, facilitando el aprendizaje y las pruebas manuales.

---

## Buenas prácticas aplicadas durante el proyecto

- Los schemas de escritura (`CreateUserRequest`, `CreateProductRequest`) son distintos de los schemas de lectura (`User`, `Product`). Esto evita exponer campos internos como `password` en las respuestas.
- El endpoint `POST /auth/login` desactiva explícitamente la seguridad global con `security: []`, haciendo explícita la intención de que es un endpoint público.
- La seguridad se declara a nivel global (`security: [{ JWT: [] }]`) en lugar de operación por operación, lo que reduce la posibilidad de olvidar proteger un endpoint nuevo.
- Los errores de autenticación, autorización y validación están estandarizados bajo el schema `ErrorResponse`.
- Cada operación define ejemplos de sus respuestas de éxito y error, incluyendo códigos de error semánticos (`USER_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `UNAUTHORIZED`).
