// TC-AUTO-01 · URL bajo prueba: /login · Requerimiento: RF-07 (autenticación de usuarios)
//
// Cubre: título, URL, elementos presentes, aserciones de texto, estilos CSS,
// acciones (type, click, clear), formulario con resultado no exitoso y exitoso.

const paso = (n, texto) => cy.paso(n, texto);

describe('TC-AUTO-01 · Autenticación en /login (RF-07)', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login').as('login');
  });

  it('muestra el formulario, rechaza credenciales inválidas y abre el inventario con las válidas', () => {
    paso(1, 'Abrir la página de inicio de sesión');
    cy.visit('/login');

    paso(2, 'Validar el título de la pestaña');
    cy.title().should('eq', 'Inventory - Iniciar sesión');

    paso(3, 'Validar la URL de la página');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    cy.location('pathname').should('eq', '/login');

    paso(4, 'Validar que los elementos de la pantalla están presentes');
    cy.get('.login-logo svg').should('be.visible');
    cy.get('.login-title').should('be.visible');
    cy.get('.login-subtitle').should('be.visible');
    cy.get('input[type="text"][placeholder="Nombre de usuario"]').should('be.visible');
    cy.get('input[type="password"][placeholder="••••••••"]').should('be.visible');
    cy.get('button[title="Mostrar contraseña"]').should('exist');
    cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled');
    cy.contains('button', 'Volver al inicio').should('be.visible');
    cy.get('.error-message').should('not.exist');

    paso(5, 'Validar los textos de la pantalla');
    cy.get('.login-title').should('have.text', 'Inventory');
    cy.get('.login-subtitle').should('have.text', 'Inicia sesión para administrar');
    cy.contains('label', 'Usuario').should('be.visible');
    cy.contains('label', 'Contraseña').should('be.visible');
    cy.get('button[type="submit"]').should('have.text', 'Iniciar sesión');

    paso(6, 'Validar los estilos CSS (fuente, colores, fondos, bordes)');
    cy.get('body')
      .should('have.css', 'font-family')
      .and('contain', 'Inter');
    cy.get('body').should('have.css', 'background-color', 'rgb(10, 14, 23)');
    cy.get('.login-card').should('have.css', 'background-color', 'rgb(17, 24, 39)');
    cy.get('.login-title')
      .should('have.css', 'color', 'rgb(241, 245, 249)')
      .and('have.css', 'font-weight', '700');
    cy.get('button[type="submit"]')
      .should('have.css', 'color', 'rgb(10, 14, 23)')
      .and('have.css', 'border-radius', '10px')
      .and('have.css', 'background-image')
      .and('contain', 'linear-gradient');

    paso(7, 'Enviar el formulario vacío: el navegador marca el usuario como obligatorio y no llama a la API');
    cy.get('button[type="submit"]').click();
    cy.get('input[type="text"]').then(($input) => {
      expect($input[0].validity.valueMissing, 'usuario vacío').to.equal(true);
    });
    cy.get('@login.all').should('have.length', 0);
    cy.location('pathname').should('eq', '/login');

    paso(8, 'Escribir usuario y contraseña incorrecta y alternar la visibilidad de la contraseña');
    cy.get('input[type="text"]').type('admin');
    cy.get('input[placeholder="••••••••"]').type('incorrecta123').should('have.attr', 'type', 'password');
    cy.get('button[title="Mostrar contraseña"]').click();
    cy.get('input[placeholder="••••••••"]')
      .should('have.attr', 'type', 'text')
      .and('have.value', 'incorrecta123');
    cy.get('button[title="Ocultar contraseña"]').click();
    cy.get('input[placeholder="••••••••"]').should('have.attr', 'type', 'password');

    paso(9, 'Enviar credenciales inválidas: la API responde 401 y se muestra el mensaje de error');
    cy.get('button[type="submit"]').click();
    cy.wait('@login').its('response.statusCode').should('eq', 401);
    cy.get('.error-message')
      .should('be.visible')
      .and('have.text', 'Credenciales inválidas')
      .and('have.css', 'color', 'rgb(255, 45, 85)');
    cy.location('pathname').should('eq', '/login');

    paso(10, 'Corregir la contraseña (clear + type) y enviar credenciales válidas');
    cy.get('input[placeholder="••••••••"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    paso(11, 'Validar la respuesta de la API: 200 con el rol del usuario');
    cy.wait('@login').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.include({ username: 'admin', role: 'Administrador', isActive: true });
    });

    paso(12, 'Validar que la URL cambia al inventario');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/inventario`);

    paso(13, 'Validar el título de la pantalla de inventario');
    cy.title().should('eq', 'Inventory - Inventario');

    paso(14, 'Validar la barra superior con la sesión iniciada');
    cy.get('.navbar').within(() => {
      cy.contains('span', 'Administrador').should('be.visible');
      cy.contains('button', 'Salir').should('be.visible');
      cy.contains('button', 'Ingresar').should('not.exist');
    });
    cy.window().then((win) => {
      const saved = JSON.parse(win.localStorage.getItem('inventory_user'));
      expect(saved).to.include({ username: 'admin', role: 'Administrador' });
    });

    paso(15, 'Cerrar sesión y validar que se vuelve a la página pública');
    cy.contains('button', 'Salir').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    cy.title().should('eq', 'Inventory - Gestor de Inventario');
    cy.contains('.navbar button', 'Ingresar').should('be.visible');
    cy.window().its('localStorage').invoke('getItem', 'inventory_user').should('be.null');
  });
});
