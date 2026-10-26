# Estado activo

**Última actualización**: 2026-10-26.

## Qué hice

Recreé el backend de `inventory-fullstack` (Spring Boot) con Node.js +
Next.js + Prisma/SQLite, siguiendo `specs/001-recreate-backend/`. Duplico
también el frontend original en `frontend/` (decisión explícita, no solo
re-apuntar su proxy), así el proyecto queda independiente del repo
original — que no toco para nada.

Los 8 grupos de endpoints están completos y verificados contra el
contrato: auth, items (con filtros), categorías, estados, responsables,
usuarios+roles, movements y dashboard — incluidas las particularidades
heredadas documentadas en `docs/DEUDA.md` (password expuesto, `"changeme"`
solo en `null`, `isActive` forzado a `true` en el PUT de responsables,
`MovementHistory` sin escritura).

Indexé el repo con `codebase-memory-mcp` (565 nodos / 1146 aristas) y dejé
la regla de usarlo para mapear y revisar archivos en `CLAUDE.md`.

Hice el primer commit y publiqué el repo en GitHub, público, bajo mi
cuenta personal: [github.com/Etrejos97/inventory-nodejs](https://github.com/Etrejos97/inventory-nodejs).
Antes de ese commit revisé `.gitignore` para que `node_modules/`, `.next/`,
`prisma/dev.db` y `.env` quedaran fuera del repo (`.env.example` sí queda,
como plantilla). También completé el `README.md` (stack, estructura, tabla
de los 19 endpoints) y agregué `docs/arquitectura.md` con el diagrama de
capas real, extraído del grafo indexado.

Verifiqué contra el código (no contra lo que decía la documentación) que
los 15 puntos de escritura del backend tocan un solo modelo Prisma por
request, así que ninguno necesita `prisma.$transaction` hoy — actualicé
`docs/DEUDA.md` con esa comprobación.

Cubrí el 500 crudo que salía al mandar un username/nombre/número de serie
duplicado, o al borrar una categoría/estado con items asociados: agregué
`conflict()` y `fromPrismaError()` en `lib/http.ts` y envolví los 10
puntos de escritura afectados (`users`, `categories`, `statuses`, `items`)
en try/catch. Verifiqué el alcance exacto contra el schema real
(`prisma/schema.prisma` + la migración aplicada) y contra el Java
original (`UserService`, `CategoryService` — tampoco pre-validan
duplicados, y no hay `@ExceptionHandler` en todo el proyecto), así que es
una desviación consciente del original, documentada en el ADR
`docs/decisiones/2026-09-02 — 409 en duplicados y en deletes bloqueados por FK.md`.
Probé los tres casos con el server real levantado (duplicado, delete
bloqueado, happy path) antes de dar el cambio por bueno.

Agregué imagen real por item (`imageUrl`, string opcional). Antes de
tocar código confirmé contra `Item.java` del original que nunca tuvo
campo de imagen — no era una brecha de contrato, es una feature nueva,
así que pasó por `specs/002-item-image-url/` y quedó documentada en el
ADR `docs/decisiones/2026-09-02 — imageUrl opcional en Item.md`. Toqué
schema + migración + validador + mapper + los dos route handlers de
items, y en el frontend `ItemForm` (campo nuevo), `ProductCard` y el
carrito (imagen real con fallback al emoji si no hay `imageUrl` o si la
URL no carga — le agregué `onError` después de verificar visualmente con
el navegador que sin eso quedaba el ícono de imagen rota). Verificado con
curl y con capturas de pantalla reales (imagen cargando, fallback por URL
rota, fallback por ausencia de imagen).

Poblé `imageUrl` en los 15 items: busqué la foto real de cada producto,
verifiqué cada URL dos veces por separado (una vez el agente que hizo la
búsqueda, otra vez yo mismo con `curl -sI` y un User-Agent de navegador)
antes de confiar en ninguna — hubo una URL de un dominio que no
reconocía (`media.lenovonews.fiestic.com`, el press kit de Lenovo en un
CDN de terceros) que verifiqué con la misma exigencia que las demás.
Actualicé `prisma/seed.ts` (para siembras futuras desde cero) y los 15
items que ya estaban en `dev.db` con un script puntual. Confirmé
visualmente en el navegador: las 15 imágenes cargan bien.

Reemplacé los ~50 emojis del frontend por íconos de `lucide-react` — no
combinaban con el look "neon" oscuro del proyecto y eran inconsistentes
entre sistemas. Es un cambio puramente visual del frontend duplicado, no
toca el backend ni el contrato, así que no le apliqué la metodología de
`specs/` (esa es para features/contrato). Toqué los 10 componentes que
tenían emojis más `index.css` (clase `.icon-inline` nueva para
ícono+texto en línea). Confirmé con grep que no quedó ningún emoji
suelto en `frontend/src`, y verifiqué visualmente en el navegador: home
pública, login, inventario, dashboard admin con sus tabs, y el flujo
completo del carrito (agregar, thumb, cerrar, eliminar, cotización,
confirmación) — todos los íconos se ven del tamaño y color correctos,
heredando `currentColor` de las variables `--neon-*` ya existentes sin
tocar esas reglas de CSS.

Armé la automatización E2E de la materia de Testing en `e2e/`, con Cypress
16.1: tres casos (`TC-AUTO-01` en `/login`, `TC-AUTO-02` en `/inventario`,
`TC-AUTO-03` en `/`) de 15 a 17 pasos cada uno. Para que cada pantalla tuviera
su propia URL y su título agregué `react-router-dom` al frontend (ADR
`docs/decisiones/2026-10-26 — Rutas con react-router y título por ruta.md`).
Los tres casos pasan contra el backend Node.js y dejan la base con los 15
elementos del seed. En el camino aparecieron dos defectos del frontend que
corregí: el guard de logout mandaba a `/login` en vez de `/`, y la búsqueda de
`ItemList` podía quedarse con la respuesta de una letra anterior (condición de
carrera, ahora descarta respuestas de filtros viejos). Los casos están en
`e2e/testrail/casos.js`; `npm run testrail:generar` produce el XML y el CSV
para importarlos a TestRail. La salida de la corrida está en
`e2e/evidencia/`.

## Próximos pasos

1. Testing: repetir los casos de Cypress contra el backend Java de
   `inventory-fullstack` cuando se corrijan BUG-001, BUG-002 y BUG-003
   (versión 2.4 del PPI), y probar en Chrome y Firefox (hoy solo Electron).
2. Si en algún momento quiero correr frontend+backend juntos con Docker o
   desplegarlos, revisar `docs/decisiones/` antes de tocar la capa de
   datos (Prisma+SQLite) o el manejo de errores (404 real, shape propio).
3. Algunas URLs de imagen (Razer, Logitech, Lenovo, Sony) están en CDNs
   alternos del fabricante, no en su dominio principal — si alguna se cae
   más adelante, está anotado el motivo en el comentario de
   `prisma/seed.ts`.

## Bloqueos

Ninguno.

## Decisiones tomadas en esta sesión (fuera del plan original aprobado)

- **Duplicar el frontend**, no solo re-apuntar su proxy — pedido explícito.
- **Sin tests ni CI en la primera vuelta**, porque el proyecto era la base
  para practicar testing. Por eso `scripts/smoke-test.mjs` y
  `.github/workflows/backend-smoke.yml` del plan original quedaron fuera,
  igual que el hook `run_related_tests.py`. El 2026-10-26 sumé solo los
  casos E2E de Cypress en `e2e/`; sigue sin haber CI.
- **Carpeta raíz renombrada** de `inventory-backend-node` a `inventory-node`
  (con `backend/` y `frontend/` adentro), porque el alcance dejó de ser
  "solo backend".
- **`proxy.ts` en vez de `middleware.ts`** — Next.js 16 renombró la
  convención, ver `docs/decisiones/`.
- **`NODE_EXTRA_CA_CERTS`** hizo falta para que `npm install` funcionara en
  esta máquina — ver `docs/decisiones/` y `~/.claude/notas/entorno-windows.md`.
- **`npm audit fix`** aplicado en `frontend/` (6 vulnerabilidades, todas
  resueltas con bumps no destructivos) — es la copia, no el original, así
  que no hay problema en mantenerla al día.
- **Repo publicado bajo cuenta personal** (`Etrejos97`), no la de trabajo
  (`EtrejosMeper`/MEPER) — el `git config` global de esta máquina apunta a
  la cuenta de trabajo, así que dejé el autor configurado en local
  (`git config --local`) solo para este repo, sin tocar el global.

## Estado git

Repo con remoto en GitHub (`origin` → `github.com/Etrejos97/inventory-nodejs`,
público), rama `main`.
