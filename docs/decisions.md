# Registro de decisiones arquitectónicas

Este documento recoge las decisiones técnicas y de diseño que pueden inferirse del estado actual del proyecto. Sigue un formato simplificado de Architecture Decision Record (ADR).

---

## ADR-001 — Adopción de la metodología API First

**Estado:** Adoptado  
**Contexto:** El objetivo educativo del proyecto es aprender a diseñar APIs de forma profesional, donde la especificación precede al código.  
**Decisión:** El contrato OpenAPI se diseña antes que cualquier implementación. El código del servidor debe respetar el contrato, no al revés.  
**Consecuencias:**
- El archivo `openapi.yaml` es la referencia oficial de la API.
- Cualquier modificación funcional requiere primero una actualización del contrato.
- La documentación y el código nunca divergen, ya que el validador lo impide en tiempo de ejecución.

---

## ADR-002 — OpenAPI 3.1.1 como formato del contrato

**Estado:** Adoptado  
**Contexto:** Existen múltiples versiones del estándar OpenAPI (2.0, 3.0.x, 3.1.x). La versión 3.1 es la más reciente y adopta JSON Schema Draft 2020-12 como estándar de validación de schemas.  
**Decisión:** Se utiliza OpenAPI 3.1.1 para aprovechar la compatibilidad total con JSON Schema, incluyendo keywords como `exclusiveMinimum` en su forma numérica.  
**Consecuencias:**
- Mayor compatibilidad con herramientas basadas en JSON Schema (como AJV 8.x).
- `exclusiveMinimum` se usa como valor numérico (no booleano), coherente con JSON Schema 2020-12.
- Algunas herramientas aún no soportan completamente OpenAPI 3.1. Este riesgo fue aceptado intencionalmente.

---

## ADR-003 — Validación automática con `express-openapi-validator`

**Estado:** Adoptado  
**Contexto:** Implementar validaciones manualmente en cada handler produce código repetitivo y propenso a errores. Existe el riesgo de que una validación se salte en algún endpoint.  
**Decisión:** Se delega toda la validación de requests y responses al middleware `express-openapi-validator`, que lee el contrato OpenAPI en tiempo de ejecución.  
**Consecuencias:**
- Los handlers no contienen lógica de validación de estructura; se limitan a lógica de negocio.
- Si el contrato define una regla, el middleware la aplica automáticamente a todos los endpoints correspondientes.
- La validación de responses actúa como red de seguridad: detecta inconsistencias entre el código y el contrato antes de que lleguen al cliente.

---

## ADR-004 — Reutilización de schemas mediante `$ref`

**Estado:** Adoptado  
**Contexto:** Los schemas de datos podrían definirse inline en cada operación, pero esto produce duplicación y dificulta la mantenibilidad.  
**Decisión:** Todos los schemas se definen en `components.schemas` y se referencian desde las operaciones con `$ref`.  
**Consecuencias:**
- Modificar un schema se propaga automáticamente a todas las operaciones que lo referencian.
- El contrato sigue el principio DRY.
- Swagger UI puede mostrar los schemas de forma centralizada, mejorando la legibilidad de la documentación.

---

## ADR-005 — Schemas separados para escritura y lectura

**Estado:** Adoptado  
**Contexto:** El schema `User` que se devuelve en respuestas no debe incluir el campo `password`. Sin embargo, el schema `CreateUserRequest` sí necesita el campo `password` como entrada.  
**Decisión:** Se mantienen schemas distintos para operaciones de escritura (`CreateUserRequest`, `UpdateUserRequest`) y de lectura (`User`). El schema de respuesta `User` no incluye `password`.  
**Consecuencias:**
- Los datos sensibles nunca se exponen en respuestas por diseño del contrato, no por lógica de código.
- Los handlers aplican destructuring para omitir `password` antes de devolver la respuesta, complementando la decisión del contrato.

---

## ADR-006 — Autenticación con JWT Bearer

**Estado:** Adoptado  
**Contexto:** La API necesita proteger sus endpoints para que solo usuarios autenticados puedan operar sobre los recursos.  
**Decisión:** Se implementa autenticación con JSON Web Tokens (JWT). El token se firma con una clave secreta y expira en 1 hora. La validación del token se integra mediante el `securityHandler` de `express-openapi-validator`.  
**Consecuencias:**
- El contrato define el esquema de seguridad `JWT` en `components.securitySchemes`.
- La seguridad se aplica globalmente con `security: [{ JWT: [] }]` a nivel raíz del contrato.
- Los endpoints públicos (`/auth/login`) optan por salir de la seguridad global explícitamente con `security: []`.
- La clave secreta (`SECRET_KEY`) está actualmente hardcodeada. Se identifica como deuda técnica para migrar a variables de entorno.

---

## ADR-007 — Datos en memoria como capa de persistencia

**Estado:** Adoptado (temporal)  
**Contexto:** En el estadio educativo actual del proyecto, introducir una base de datos real añadiría complejidad accidental que desviaría el foco del aprendizaje de API First.  
**Decisión:** Los datos de usuarios y productos se almacenan en arrays JavaScript en memoria. No persisten entre reinicios del servidor.  
**Consecuencias:**
- El proyecto puede ejecutarse sin dependencias externas de infraestructura.
- Los datos se pierden al reiniciar el servidor. Esto es una limitación conocida y aceptada.
- La capa de datos está completamente acoplada al servidor en `src/index.js`. Se identifica como punto de refactorización cuando el proyecto evolucione hacia persistencia real.

---

## ADR-008 — ESM nativo como sistema de módulos

**Estado:** Adoptado  
**Contexto:** Node.js soporta tanto CommonJS (`require`) como ES Modules (`import/export`). ESM es el estándar moderno de JavaScript.  
**Decisión:** El proyecto usa `"type": "module"` en `package.json`, habilitando ES Modules de forma nativa en todo el proyecto.  
**Consecuencias:**
- Todos los imports usan la sintaxis `import ... from '...'`.
- No se puede usar `require()` sin adaptadores.
- Algunas dependencias antiguas pueden presentar incompatibilidades. En este proyecto no se ha observado ninguna con las dependencias actuales.

---

## ADR-009 — `node --watch` como herramienta de recarga en desarrollo

**Estado:** Adoptado  
**Contexto:** El desarrollo en caliente requiere reiniciar el servidor ante cambios en el código. La herramienta más común para esto es `nodemon`, que requiere instalación.  
**Decisión:** Se usa el flag `--watch` nativo de Node.js (disponible desde Node.js 18) en el script `dev`, eliminando la necesidad de instalar `nodemon` como dependencia de desarrollo.  
**Consecuencias:**
- El proyecto no tiene `devDependencies` declaradas.
- La experiencia de desarrollo es equivalente a `nodemon` para este caso de uso.
- Requiere Node.js 18 o superior.
