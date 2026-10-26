// TC-AUTO-03 · URL bajo prueba: / (catálogo público) · Cobertura adicional de RF-02
//
// Cubre: título, URL, elementos presentes (menú de navegación, categorías, imágenes,
// botones), textos, estilos CSS, acciones (click) y un flujo con mensaje de éxito
// (solicitud de cotización desde el carrito). No requiere sesión iniciada.

const paso = (n, texto) => cy.paso(n, texto);

const CATEGORIAS = ['Hardware', 'Software', 'Licencias', 'Redes', 'Consumibles', 'Gaming', 'Audio y Video'];
const PRODUCTO = 'Router TP-Link Archer AX73'; // única pieza de la categoría Redes en el seed

describe('TC-AUTO-03 · Catálogo público en / (RF-02, cobertura adicional)', () => {
  beforeEach(() => {
    cy.stubExternalImages();
  });

  it('muestra el catálogo, filtra por categoría y completa una solicitud de cotización', () => {
    paso(1, 'Abrir la página pública sin sesión iniciada');
    cy.visit('/');

    paso(2, 'Validar el título de la pestaña');
    cy.title().should('eq', 'Inventory - Gestor de Inventario');

    paso(3, 'Validar la URL de la página');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    cy.location('pathname').should('eq', '/');

    paso(4, 'Validar que los elementos de la pantalla están presentes');
    cy.get('.navbar h1').should('be.visible');
    cy.get('.navbar').within(() => {
      cy.contains('button', 'Inicio').should('be.visible');
      cy.contains('button', 'Ingresar').should('be.visible');
      cy.get('button').should('have.length', 3); // Inicio, Ingresar y el carrito
    });
    cy.get('.hero__badge').should('be.visible');
    cy.get('.hero__title').should('be.visible');
    cy.contains('a', 'Ver productos').should('be.visible');
    cy.contains('button', 'Gaming').should('be.visible');
    cy.get('.category-tabs').should('be.visible');
    cy.get('.product-grid').should('be.visible');

    paso(5, 'Validar los textos del encabezado y de la franja de beneficios');
    cy.get('.navbar h1').should('contain.text', 'INVENTORY');
    cy.get('.hero__badge').should('contain.text', 'Ofertas exclusivas');
    cy.get('.hero__title').should('contain.text', 'Tecnología que').and('contain.text', 'impulsa tu mundo');
    cy.get('.hero__subtitle').should('contain.text', 'Descubre los mejores equipos');
    ['Envío nacional', 'Pago seguro', 'Soporte 24/7', 'Garantía incluida'].forEach((texto) => {
      cy.contains('.hero__content span', texto).should('be.visible');
    });

    paso(6, 'Validar los estilos CSS (tamaño, peso, color, bordes redondeados)');
    cy.get('.navbar h1')
      .should('have.css', 'font-weight', '800')
      .and('have.css', 'cursor', 'pointer');
    cy.contains('.navbar button', 'Inicio')
      .should('have.class', 'nav-link--active')
      .and('have.css', 'color', 'rgb(0, 240, 255)');
    cy.get('.hero__title')
      .should('have.css', 'font-size', '44px')
      .and('have.css', 'font-weight', '900');
    cy.get('.hero__subtitle')
      .should('have.css', 'color', 'rgb(148, 163, 184)')
      .and('have.css', 'font-size', '16.8px');
    cy.contains('.category-tab', 'Todos')
      .should('have.class', 'category-tab--active')
      .and('have.css', 'color', 'rgb(10, 14, 23)')
      .and('have.css', 'border-radius', '999px');

    paso(7, 'Validar las pestañas de categoría (menú de filtro) y la cantidad de productos');
    cy.get('.category-tab').then(($tabs) => {
      expect([...$tabs].map((t) => t.textContent)).to.deep.equal(['Todos', ...CATEGORIAS]);
    });
    cy.get('.product-card').should('have.length', 15);

    paso(8, 'Validar que cada producto muestra su imagen con texto alternativo');
    cy.get('.product-card__image img').should('have.length', 15);
    cy.get('.product-card').each(($card) => {
      const nombre = $card.find('.product-card__name').text();
      cy.wrap($card)
        .find('.product-card__image img')
        .should('have.attr', 'alt', nombre)
        .and(($img) => expect($img[0].naturalWidth).to.be.greaterThan(0));
    });

    paso(9, 'Elegir una categoría sin productos (Software): se muestra el mensaje de vacío');
    cy.contains('.category-tab', 'Software').click().should('have.class', 'category-tab--active');
    cy.get('.product-card').should('not.exist');
    cy.contains('No hay productos en esta categoría').should('be.visible');

    paso(10, 'Elegir la categoría Redes: queda una sola tarjeta con los datos del producto');
    cy.contains('.category-tab', 'Redes').click().should('have.class', 'category-tab--active');
    cy.get('.product-card').should('have.length', 1);
    cy.get('.product-card').within(() => {
      cy.get('.product-card__name').should('have.text', PRODUCTO);
      cy.get('.product-card__category').should('have.text', 'Redes');
      cy.get('.product-card__price').should('have.text', '$299.900');
      cy.contains('10 en stock').should('be.visible');
      cy.contains('button', 'Agregar al carrito').should('be.enabled');
    });

    paso(11, 'Agregar el producto al carrito: el contador de la barra superior pasa a 1');
    cy.contains('.product-card button', 'Agregar al carrito').click();
    cy.get('.navbar button').last().should('contain.text', '1');

    paso(12, 'Abrir el carrito y validar su contenido');
    cy.get('.navbar button').last().click();
    cy.get('.cart-sidebar').within(() => {
      cy.contains('h2', 'Carrito').should('contain.text', '(1)');
      cy.get('.cart-item-name').should('have.text', PRODUCTO);
      cy.get('.cart-item-qty').should('have.text', '1');
      cy.get('.cart-total-value').should('have.text', '$299.900');
    });

    paso(13, 'Subir la cantidad con el botón + y validar el nuevo total');
    cy.get('.cart-item-qty-btn').contains('+').click();
    cy.get('.cart-item-qty').should('have.text', '2');
    cy.get('.cart-total-value').should('have.text', '$599.800');
    cy.contains('.cart-sidebar h2', '(2)').should('be.visible');

    paso(14, 'Solicitar la cotización y validar el resumen antes de confirmar');
    cy.contains('button', 'Solicitar cotización').click();
    cy.get('.modal').within(() => {
      cy.contains('h2', 'Resumen de cotización').should('be.visible');
      cy.contains(`${PRODUCTO} × 2`).should('be.visible');
      cy.contains('$599.800').should('be.visible');
    });

    paso(15, 'Confirmar la cotización: aparece el mensaje de éxito y el carrito queda vacío');
    cy.contains('.modal button', 'Confirmar cotización').click();
    cy.contains('¡Cotización solicitada!')
      .should('be.visible')
      .and('have.css', 'color', 'rgb(34, 214, 94)');
    cy.contains('Te contactaremos pronto con los detalles.').should('be.visible');
    cy.get('.cart-sidebar', { timeout: 8000 }).should('not.exist');
    cy.get('.navbar button').last().should('not.contain.text', '1');

    paso(16, 'Pulsar Ingresar: la URL cambia a /login');
    cy.contains('.navbar button', 'Ingresar').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`);
    cy.title().should('eq', 'Inventory - Iniciar sesión');
  });
});
