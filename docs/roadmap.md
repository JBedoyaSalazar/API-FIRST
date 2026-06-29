# Roadmap

Este documento registra el estado actual del proyecto y los objetivos planificados para su evolución.

---

## Estado actual

**Versión:** 1.2.3  
**Estado:** En desarrollo activo (proyecto educativo)

---

## Recursos implementados

### Autenticación

- `POST /auth/login` — Recibe email y password, devuelve un JWT firmado con duración de 1 hora.

### Usuarios

- `POST /users` — Crea un usuario. Requiere `name`, `age`, `email` y `password`. La password no se devuelve en la respuesta.
- `GET /users/{id}` — Obtiene un usuario por su UUID. La password no se incluye en la respuesta.
- `PATCH /users/{id}` — Actualiza parcialmente un usuario. Todos los campos son opcionales.

### Productos

- `GET /products` — Devuelve todos los productos almacenados en memoria.
- `POST /products` — Crea un producto. Requiere `name`, `category`, `price` e `inStock`.
- `GET /products/{id}` — Obtiene un producto por su UUID.
- `PUT /products/{id}` — Reemplaza completamente un producto existente.
- `PATCH /products/{id}` — Actualiza parcialmente un producto existente.
- `DELETE /products/{id}` — Elimina un producto. Responde con `204 No Content`.

### Infraestructura

- Contrato OpenAPI 3.1.1 con 13 schemas reutilizables.
- Validación automática de requests y responses mediante `express-openapi-validator`.
- Documentación interactiva disponible en `/docs` (Swagger UI).
- Autenticación global con Bearer JWT. Los endpoints públicos optan por salir explícitamente.
- Dos servidores declarados en el contrato: `v1` y `v2`.
- Datos en memoria (arrays JavaScript) como capa de persistencia temporal.

---

## Recursos pendientes

### Funcionalidades

- `GET /users` — Listar todos los usuarios (no implementado ni definido en el contrato actualmente).
- `DELETE /users/{id}` — Eliminar un usuario (no implementado).
- `POST /products/{id}/ratings` — Agregar una valoración a un producto (no implementado).

### Infraestructura

- Variables de entorno con `.env` (la `SECRET_KEY` del JWT está hardcodeada en el código).
- Capa de persistencia real (base de datos relacional o documental).
- Hashing de contraseñas (`bcrypt` o similar). Actualmente las passwords se almacenan en texto plano en los arrays en memoria.
- Pruebas automatizadas (unitarias e integración).

---

## Objetivos futuros

### Aprendizaje

- Explorar cómo versionar la API correctamente (estrategias de versionado `/v1`, `/v2`).
- Implementar paginación y filtros en `GET /products`.
- Añadir un recurso adicional para consolidar la metodología API First.

### Arquitectura

- Refactorizar `src/index.js` separando las responsabilidades en módulos: `routes/`, `controllers/`, `data/`.
- Implementar un sistema de gestión de variables de entorno con validación al arrancar.
- Evaluar el uso de una capa de repositorio para desacoplar la lógica de negocio del origen de los datos.

### Seguridad

- Migrar la `SECRET_KEY` a variables de entorno.
- Implementar hashing de contraseñas antes de almacenarlas.
- Agregar renovación de tokens (refresh token).

---

## Posibles integraciones

- **Base de datos**: PostgreSQL (con Prisma) o MongoDB (con Mongoose), para reemplazar los arrays en memoria.
- **Variables de entorno**: `dotenv` para gestionar configuración sensible.
- **Testing**: Vitest o Jest para pruebas unitarias, Supertest para pruebas de integración HTTP.

---

## Notas adicionales

La arquitectura actual (todo en un solo archivo `src/index.js`, datos en memoria) es una decisión consciente del estado de aprendizaje del proyecto. No representa una limitación técnica, sino una simplificación intencional para mantener el foco en la metodología API First sin complejidad accidental.
