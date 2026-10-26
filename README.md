# inventory-node

Recreé el backend de `inventory-fullstack` (Spring Boot + H2) con Node.js,
Next.js y Prisma sobre SQLite, manteniendo el mismo contrato de API. Duplico
también el frontend React original en `frontend/` para probarlo contra el
backend nuevo sin tocar el repo original.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Next.js 16 (App Router, TypeScript), Prisma 6, SQLite |
| Frontend | React 19, Vite |
| Validación | Zod |

## Estructura

- `backend/` — API en Next.js, puerto 8080.
- `frontend/` — copia del frontend original (Vite), puerto 5173, proxy a `:8080`.
  Rutas con react-router: `/`, `/login`, `/inventario` y `/admin`, cada una con
  su título de pestaña.
- `e2e/` — casos automatizados con Cypress y los archivos de importación a TestRail.
- `specs/001-recreate-backend/` — requirements, plan y tasks de la recreación.
- `docs/` — [`CONSTITUTION.md`](docs/CONSTITUTION.md) (principios no
  negociables), [`DEUDA.md`](docs/DEUDA.md) (particularidades heredadas del
  original), [`arquitectura.md`](docs/arquitectura.md) y
  [`decisiones/`](docs/decisiones/) (un ADR por decisión no obvia).

El backend original de referencia (`inventory-fullstack`, Spring Boot) vive
fuera de este repo, en mi máquina — no es un submódulo ni una dependencia
del proyecto.

## Levantar el backend

```bash
cd backend
npm install
cp .env.example .env       # si no existe ya
npm run db:setup            # migración + seed (15 items, admin/admin123)
npm run dev                  # http://localhost:8080
```

Dataset más grande (opcional, ~30 items, 4 usuarios):

```bash
npm run db:seed-full
```

## Levantar el frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, proxy /api -> :8080
```

## Pruebas E2E (Cypress)

Tres casos automatizados, cada uno sobre una URL distinta del mismo dominio
(`http://localhost:5173`):

| Caso | URL | Spec |
|---|---|---|
| TC-AUTO-01 · Autenticación | `/login` | `e2e/cypress/e2e/01-login.cy.js` |
| TC-AUTO-02 · Registro y consulta de inventario | `/inventario` | `e2e/cypress/e2e/02-inventario.cy.js` |
| TC-AUTO-03 · Catálogo público y cotización | `/` | `e2e/cypress/e2e/03-catalogo.cy.js` |

Cada caso tiene entre 15 y 17 pasos numerados e incluye comandos de acción,
aserciones de texto, de elementos presentes, de título, de URL, de estilos CSS
y de opciones de listas desplegables. Con el backend y el frontend levantados
y la base sembrada (`npm run db:setup`):

```bash
cd e2e
npm install
npm run cypress:run     # headless, los 3 casos
npm run cypress:open    # modo interactivo
```

Si Cypress arranca con `bad option: --smoke-test`, la variable de entorno
`ELECTRON_RUN_AS_NODE` está definida (pasa en terminales de VS Code). Hay que
quitarla para ese comando.

Los casos para TestRail salen de `e2e/testrail/casos.js`. `npm run
testrail:generar` regenera `inventory-app-casos.xml` y
`inventory-app-casos.csv`, listos para importar.

## Endpoints

19 rutas sobre 8 grupos, todas con el mismo shape de request/response que
el backend Java original.

| Grupo | Rutas |
|---|---|
| Auth | `POST /api/auth/login` |
| Items | `GET/POST /api/items`, `GET/PUT/DELETE /api/items/:id` |
| Categorías | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id` |
| Estados | `GET/POST /api/statuses`, `GET/PUT/DELETE /api/statuses/:id` |
| Responsables | `GET/POST /api/responsibles`, `GET/PUT/DELETE /api/responsibles/:id` |
| Usuarios | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id`, `GET /api/users/roles` |
| Movimientos | `GET /api/movements` |
| Dashboard | `GET /api/dashboard` |

## Qué replico y qué no

Contrato de API 1:1 con el original: mismos endpoints, mismos shapes,
mismas particularidades heredadas (documentadas en
[`docs/DEUDA.md`](docs/DEUDA.md) — password sin hashear, quirks de
`changeme`, `isActive` forzado en responsables). Sin tests ni CI en esta
primera vuelta: este proyecto es la base sobre la que voy a practicar
testing después.
