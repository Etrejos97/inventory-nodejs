const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 8000,
    video: true,
    screenshotOnRunFailure: true,
    // Cada spec arranca con el navegador limpio (sin sesión ni carrito heredados).
    testIsolation: true,
    setupNodeEvents(on) {
      // Imprime cada paso en la terminal para que `cypress run` deje el recorrido en el log.
      on('task', {
        paso(mensaje) {
          console.log(mensaje);
          return null;
        },
      });
    },
  },
  // Cypress 16 reemplazó env por expose para valores públicos; son datos del seed.
  expose: {
    apiUrl: 'http://localhost:8080/api',
    adminUser: 'admin',
    adminPassword: 'admin123',
  },
});
