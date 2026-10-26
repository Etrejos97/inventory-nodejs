// Las fotos de los productos viven en CDNs de terceros. Las respondo con una
// imagen local para que las pruebas no dependan de internet ni de que el CDN
// bloquee la petición (si una imagen falla, el frontend la reemplaza por un ícono).
// Es un SVG de texto porque el body de una respuesta stub solo admite string u objeto.
const IMAGEN_STUB =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#1f2937"/></svg>';

Cypress.Commands.add('stubExternalImages', () => {
  cy.intercept({ method: 'GET', url: /^https?:\/\/(?!localhost|127\.0\.0\.1)/ }, (req) => {
    // Un <img> pide con Accept: image/...; cualquier otra petición externa sigue su camino.
    if (String(req.headers.accept || '').includes('image/')) {
      req.reply({
        statusCode: 200,
        headers: { 'content-type': 'image/svg+xml' },
        body: IMAGEN_STUB,
      });
    } else {
      req.continue();
    }
  });
});

// Inicia sesión llamando a la API y deja al usuario en el localStorage, que es
// donde el frontend guarda la sesión. Evita repetir el formulario de login en
// los casos que no lo prueban.
Cypress.Commands.add('visitAsAdmin', (path) => {
  cy.request('POST', `${Cypress.expose('apiUrl')}/auth/login`, {
    username: Cypress.expose('adminUser'),
    password: Cypress.expose('adminPassword'),
  }).then(({ body }) => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('inventory_user', JSON.stringify(body));
      },
    });
  });
});

// En modo dev, Next compila cada ruta la primera vez que la piden y /api/items/:id
// llegó a tardar más de 40 s. La pido antes del caso para que esa espera no caiga
// dentro de una aserción.
Cypress.Commands.add('warmUpItemRoutes', () => {
  cy.request({
    url: `${Cypress.expose('apiUrl')}/items/1`,
    timeout: 120000,
    failOnStatusCode: false,
  });
});

// Borra por API los elementos de prueba que crea un caso, para dejar la base
// como estaba y poder repetir la ejecución.
Cypress.Commands.add('deleteItemsByName', (name) => {
  cy.request(`${Cypress.expose('apiUrl')}/items?search=${encodeURIComponent(name)}`).then(
    ({ body }) => {
      body
        .filter((item) => item.name === name)
        .forEach((item) => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.expose('apiUrl')}/items/${item.id}`,
            timeout: 120000,
            failOnStatusCode: false,
          });
        });
    },
  );
});

// Marca un paso numerado del caso: queda en el log del runner y en la terminal.
Cypress.Commands.add('paso', (numero, texto) => {
  cy.log(`**Paso ${numero}:** ${texto}`);
  cy.task('paso', `    Paso ${String(numero).padStart(2, ' ')}: ${texto}`, { log: false });
});
