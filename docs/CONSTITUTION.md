# Constitución — inventory-node

Principios no negociables de este proyecto. Cualquier cambio que los toque
lleva su propio bump de versión abajo y una línea explicando qué cambió.

## 1. Fidelidad de contrato por encima de mejoras no pedidas

El backend Node/Next replica el contrato del backend Java original
(`C:\Dev\Pruebas PPI\inventory-fullstack\backend`) campo por campo: mismas
rutas, mismo shape de request/response, mismos status codes en el happy
path. No "arreglo" nada del original sin decirlo explícito en
[`docs/decisiones/`](decisiones/) o en [`DEUDA.md`](DEUDA.md).

## 2. Toda desviación se documenta, ninguna es silenciosa

Si el comportamiento nuevo difiere del original, hay un ADR en
`docs/decisiones/` explicando qué cambié y por qué. Si el comportamiento es
igual al original pero es una rareza heredada (no un diseño deliberado),
vive en `DEUDA.md`, no en el código sin comentario.

## 3. Capa de datos simple

SQLite vía Prisma. Sin Docker, sin Postgres, sin infraestructura extra —
equivalente en simplicidad al H2 in-memory del original.

## 4. Sin autenticación real

El login compara password en texto plano, igual que el original. No agrego
JWT, hash de contraseñas ni sesiones sin que se pida explícitamente.

## 5. Metodología: specs antes de código

Cada feature nueva pasa por `specs/<NNN-nombre>/{requirements,plan,tasks}.md`
antes del primer commit de código. `ESTADO.md` en la raíz es el puntero
"estás aquí" y se reescribe al cerrar cada bloque de trabajo.

## 6. No-goals explícitos de esta primera vuelta

- No toco el repo original (`inventory-fullstack`) para nada.
- No hasheo passwords ni invento un sistema de auditoría real para
  `MovementHistory`.
- Los tests del backend y los unitarios del frontend quedan fuera. La única
  automatización es la E2E con Cypress en `e2e/`, que armé para la práctica de
  testing de la universidad. No hay CI todavía. Ver `ESTADO.md`.
- No pagino ni versiono nada que el original tampoco lo haga.

---

**v1.0.0** — 2026-08-31 — versión inicial.