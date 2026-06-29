# Hallazgos técnicos

Este documento registra investigaciones técnicas realizadas durante el desarrollo del proyecto. Su propósito es servir como memoria técnica para futuras referencias, tanto para el autor del proyecto como para cualquier colaborador que encuentre comportamientos similares.

---

## HT-001 — Comportamiento de `multipleOf: 0.01` con punto flotante en AJV

**Fecha de observación:** Junio 2026  
**Entorno:**
- Node.js (ESM)
- Express 5.2.1
- express-openapi-validator 5.6.2
- AJV 8.20.0 (utilizado internamente por express-openapi-validator)
- OpenAPI 3.1.1

---

### Contexto

El schema `Product` en `openapi.yaml` define el precio de la siguiente manera:

```yaml
price:
  type: number
  multipleOf: 0.01
  exclusiveMinimum: 0
  description: Precio del producto
```

La restricción `multipleOf: 0.01` tiene como objetivo garantizar que el precio tenga como máximo dos decimales, siendo coherente con el formato monetario estándar (por ejemplo: `19.99`, `150.50`, `1299.00`).

---

### Comportamiento observado

Durante el desarrollo, un valor de `price: 19.99` fue **rechazado por el validador de respuestas** al indicar que no cumplía la restricción `multipleOf: 0.01`.

El mismo validador aceptó otros valores como:

- `20` (entero, sin decimales) → **validación exitosa**
- `59.99` → **validación exitosa** (en distintos contextos de prueba)

Eliminando la restricción `multipleOf: 0.01` del contrato, el valor `19.99` era aceptado correctamente, lo que descartó un error en el formato general del schema o en el endpoint.

---

### Análisis

Este comportamiento es consistente con un fenómeno conocido en la representación de números de punto flotante en el estándar IEEE 754, que es el utilizado por JavaScript (y por extensión por AJV al validar).

El problema específico radica en cómo AJV evalúa la operación `multipleOf`. La validación se realiza internamente con una operación de división y comparación del residuo contra cero:

```javascript
// Simplificación de la evaluación interna
value % divisor === 0
// Que en punto flotante puede comportarse como:
19.99 % 0.01 → 0.009999999999998... (no exactamente 0)
```

El número `19.99` no puede representarse de forma exacta en punto flotante binario (IEEE 754 de 64 bits), lo que produce un error de representación que acumula al momento de calcular el residuo.

En cambio, `20 % 0.01` produce `0` de forma exacta porque `20` es representable exactamente en punto flotante, y `59.99 % 0.01` puede arrojar `0` en algunas implementaciones dependiendo de cómo el motor JavaScript optimice la operación internamente en ese contexto de ejecución específico.

---

### Estado

Este comportamiento **no ha sido confirmado como un bug de AJV o de express-openapi-validator**. Las hipótesis son:

1. **Error de representación IEEE 754**: el valor `19.99` no puede representarse con exactitud en punto flotante binario, causando que la evaluación `multipleOf` falle de forma inconsistente.
2. **Variaciones entre versiones de AJV**: AJV 8.x introdujo cambios en la gestión de `multipleOf` para JSON Schema. El comportamiento puede diferir según la versión exacta instalada transitivamente.
3. **Comportamiento dependiente del contexto de prueba**: la observación de que `59.99` funciona mientras que `19.99` no sugiere que la representación exacta del número específico en memoria puede variar.

Este hallazgo se registra para investigación futura. No se recomienda eliminar la restricción `multipleOf: 0.01` del contrato sin antes investigar la causa raíz y evaluar si existe una configuración de AJV que resuelva el problema de forma limpia.

---

### Referencias para continuar la investigación

- [AJV multipleOf handling — GitHub Issues](https://github.com/ajv-validator/ajv/issues?q=multipleOf)
- [JSON Schema specification — multipleOf](https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples)
- [IEEE 754 floating point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format)

---

---

## Sección para futuros hallazgos

Esta sección se reserva para registrar nuevas investigaciones técnicas conforme evolucione el proyecto.

Los hallazgos deben seguir el formato establecido por HT-001:

- **Identificador**: `HT-XXX`
- **Fecha de observación**
- **Entorno** (versiones exactas involucradas)
- **Contexto** (qué parte del sistema y bajo qué configuración se observó el comportamiento)
- **Comportamiento observado** (qué ocurrió, con ejemplos concretos)
- **Análisis** (hipótesis técnicas que expliquen el comportamiento)
- **Estado** (investigación en curso, resuelto, descartado)
- **Referencias** (issues, documentación, estándares relevantes)
