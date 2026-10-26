---
tipo: adr
estado: aceptada
fecha: 2026-10-26
---

# Rutas con react-router y título por ruta

## Contexto

El frontend original no tenía router: cambiaba de pantalla con un estado
`page` y todas las vistas vivían en la URL `/`. Para la entrega de
automatización de la materia de Testing necesito casos de Cypress que
apunten a URLs distintas del mismo dominio y que validen el título de la
pestaña, y con una sola URL y un título fijo eso no se puede.

## Decisión

Agrego `react-router-dom` al frontend con cuatro rutas: `/` (catálogo
público), `/login`, `/inventario` y `/admin`. Cada ruta pone su propio
`document.title` ("Inventory - Iniciar sesión", "Inventory - Inventario",
etc.). Una ruta desconocida vuelve a `/`.

Sin sesión, `/inventario` y `/admin` redirigen a `/`. Con sesión, `/` y
`/login` redirigen a `/inventario`. Al cerrar sesión no navego a mano: el
guard de "sin usuario en ruta protegida" hace la redirección. Un
`navigate('/')` en el mismo handler que `setUser(null)` llegaba después del
render con `user = null`, y la URL terminaba en `/login`. Lo encontré con
TC-AUTO-01.

## Por qué no toca el contrato

Es un cambio solo del frontend duplicado. El backend, la API y el
comportamiento de cada pantalla siguen igual; solo cambia que la pantalla
activa ahora se refleja en la URL y se puede abrir directo.

## Consecuencias

Servir el frontend en producción exige que el servidor devuelva
`index.html` para `/login`, `/inventario` y `/admin`. Con Vite en
desarrollo ya funciona. Si más adelante despliego el frontend, tengo que
configurar ese fallback.
