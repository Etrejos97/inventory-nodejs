// TC-AUTO-02 · URL bajo prueba: /inventario · Requerimientos: RF-01 (registro) y RF-02 (consulta)
//
// Cubre: título, URL, elementos presentes, textos, estilos CSS, menús desplegables
// (opciones y selección), búsqueda, formulario con resultado no exitoso y exitoso.
// Parte de la base sembrada (15 elementos, usuario admin).

const paso = (n, texto) => cy.paso(n, texto);

const NOMBRE = 'Monitor LG UltraGear 27" QHD';
const SERIE = 'LG-UG27-QHD-014';
const SERIE_EXISTENTE = 'TPLINK-AX73-001'; // Router TP-Link, viene en el seed

const CATEGORIAS = ['Hardware', 'Software', 'Licencias', 'Redes', 'Consumibles', 'Gaming', 'Audio y Video'];
const ESTADOS = ['Disponible', 'En uso', 'En mantenimiento', 'Dado de baja'];

const opciones = ($select) => [...$select[0].options].map((o) => o.textContent.trim());

describe('TC-AUTO-02 · Registro y consulta en /inventario (RF-01, RF-02)', () => {
  before(() => {
    cy.warmUpItemRoutes();
    cy.deleteItemsByName(NOMBRE);
  });
  after(() => cy.deleteItemsByName(NOMBRE));

  beforeEach(() => {
    cy.intercept('POST', '**/api/items').as('crearElemento');
  });

  it('consulta con filtros y búsqueda, y registra un elemento tras corregir un error del formulario', () => {
    paso(1, 'Iniciar sesión como Administrador y abrir /inventario');
    cy.visitAsAdmin('/inventario');

    paso(2, 'Validar el título de la pestaña');
    cy.title().should('eq', 'Inventory - Inventario');

    paso(3, 'Validar la URL de la página');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/inventario`);

    paso(4, 'Validar que los elementos de la pantalla están presentes');
    cy.get('.navbar').within(() => {
      cy.contains('button', 'Inventario').should('be.visible');
      cy.contains('button', 'Admin').should('be.visible');
      cy.contains('button', 'Salir').should('be.visible');
    });
    cy.contains('.toolbar h2', 'Inventario').should('be.visible');
    cy.contains('button', '+ Nuevo elemento').should('be.visible');
    cy.get('.filters input[placeholder="Buscar…"]').should('be.visible');
    cy.get('.filters select').should('have.length', 2);
    cy.get('.card').should('have.length', 4);
    cy.get('table thead th').should('have.length', 7);

    paso(5, 'Validar los textos: tarjetas resumen, encabezados de la tabla y cantidad de filas');
    cy.get('.card__label').then(($labels) => {
      expect([...$labels].map((l) => l.textContent)).to.deep.equal([
        'Productos',
        'Stock total',
        'Stock bajo',
        'Sin stock',
      ]);
    });
    cy.get('table thead th').then(($ths) => {
      expect([...$ths].map((th) => th.textContent)).to.deep.equal([
        'Producto',
        'Categoría',
        'Estado',
        'Stock',
        'Stock mín.',
        'Valor',
        'Acciones',
      ]);
    });
    cy.get('tbody tr').should('have.length', 15);
    cy.get('.card__value').first().should('have.text', '15');

    paso(6, 'Validar los estilos CSS (color, fondo, mayúsculas, fuente)');
    cy.contains('.navbar button', 'Inventario')
      .should('have.class', 'nav-link--active')
      .and('have.css', 'color', 'rgb(0, 240, 255)');
    cy.contains('button', '+ Nuevo elemento')
      .should('have.css', 'color', 'rgb(10, 14, 23)')
      .and('have.css', 'font-weight', '600')
      .and('have.css', 'background-image')
      .and('contain', 'linear-gradient');
    cy.get('thead th')
      .first()
      .should('have.css', 'color', 'rgb(100, 116, 139)')
      .and('have.css', 'text-transform', 'uppercase');
    cy.get('.card__value')
      .first()
      .should('have.css', 'font-size', '28px')
      .and('have.css', 'font-weight', '700')
      .and('have.css', 'color', 'rgb(241, 245, 249)');

    paso(7, 'Validar las opciones de los menús desplegables de categoría y estado');
    cy.get('.filters select')
      .eq(0)
      .should(($select) => {
        expect(opciones($select)).to.deep.equal(['Todas las categorías', ...CATEGORIAS]);
      });
    cy.get('.filters select')
      .eq(1)
      .should(($select) => {
        expect(opciones($select)).to.deep.equal(['Todos los estados', ...ESTADOS]);
      });

    paso(8, 'Seleccionar la categoría Hardware: solo quedan los 6 elementos de Hardware');
    cy.get('.filters select').eq(0).select('Hardware');
    cy.get('tbody tr').should('have.length', 6);
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(1).should('have.text', 'Hardware');
    });

    paso(9, 'Agregar el estado Disponible: los filtros se combinan y quedan 3 elementos');
    cy.get('.filters select').eq(1).select('Disponible');
    cy.get('tbody tr').should('have.length', 3);
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(2).should('have.text', 'Disponible');
    });

    paso(10, 'Quitar los filtros y buscar "laptop" y "LAPTOP": la búsqueda no distingue mayúsculas');
    cy.get('.filters select').eq(0).select('Todas las categorías');
    cy.get('.filters select').eq(1).select('Todos los estados');
    cy.get('tbody tr').should('have.length', 15);
    cy.get('.filters input').type('laptop');
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr strong').each(($name) => expect($name.text()).to.match(/laptop/i));
    cy.get('.filters input').clear().type('LAPTOP');
    cy.get('tbody tr').should('have.length', 2);

    paso(11, 'Buscar un texto que no existe: se muestra el mensaje de lista vacía');
    cy.get('.filters input').clear().type('zzz-no-existe');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('tbody tr td').should('have.text', 'No hay elementos registrados');
    cy.get('.filters input').clear();
    cy.get('tbody tr').should('have.length', 15);

    paso(12, 'Abrir el formulario "Nuevo elemento" y validar sus campos y listas desplegables');
    cy.contains('button', '+ Nuevo elemento').click();
    cy.get('.modal').within(() => {
      cy.contains('h2', 'Nuevo elemento').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="serialNumber"]').should('be.visible');
      cy.get('input[name="acquisitionDate"]').should('have.attr', 'type', 'date');
      cy.get('textarea[name="description"]').should('be.visible');
      cy.contains('button', 'Cancelar').should('be.visible');
      cy.contains('button', 'Crear').should('be.visible');
      cy.get('select[name="categoryId"]').should(($select) => {
        expect(opciones($select)).to.deep.equal(['Seleccionar…', ...CATEGORIAS]);
      });
      cy.get('select[name="statusId"]').should(($select) => {
        expect(opciones($select)).to.deep.equal(ESTADOS);
      });
    });

    paso(13, 'Enviar el formulario sin datos: el navegador marca el nombre y la categoría como obligatorios');
    cy.contains('.modal button', 'Crear').click();
    cy.get('.modal input[name="name"]').then(($input) => {
      expect($input[0].validity.valueMissing, 'nombre vacío').to.equal(true);
    });
    cy.get('.modal select[name="categoryId"]').then(($select) => {
      expect($select[0].validity.valueMissing, 'categoría sin elegir').to.equal(true);
    });
    cy.get('@crearElemento.all').should('have.length', 0);
    cy.get('.modal').should('be.visible');

    paso(14, 'Llenar todos los campos con un número de serie ya registrado: la API responde 409 y el formulario muestra el error');
    cy.get('.modal input[name="name"]').type(NOMBRE);
    cy.get('.modal select[name="categoryId"]').select('Hardware');
    cy.get('.modal select[name="statusId"]').select('Disponible');
    cy.get('.modal input[name="serialNumber"]').type(SERIE_EXISTENTE);
    cy.get('.modal input[name="acquisitionDate"]').type('2026-08-20');
    cy.get('.modal input[name="location"]').type('Bodega A - E5');
    cy.get('.modal input[name="purchaseValue"]').type('1290000');
    cy.get('.modal input[name="stock"]').type('6');
    cy.get('.modal input[name="minStock"]').type('2');
    cy.get('.modal textarea[name="description"]').type('27" QHD 165Hz, panel IPS, HDR10');
    cy.contains('.modal button', 'Crear').click();
    cy.wait('@crearElemento').its('response.statusCode').should('eq', 409);
    cy.get('.modal .error-message')
      .should('be.visible')
      .and('have.text', `Ya existe un ítem con número de serie: ${SERIE_EXISTENTE}`);
    cy.get('.modal').should('be.visible');

    paso(15, 'Corregir el número de serie y volver a enviar: la API responde 201 y el formulario se cierra');
    cy.get('.modal input[name="serialNumber"]').clear().type(SERIE);
    cy.contains('.modal button', 'Crear').click();
    cy.wait('@crearElemento').then(({ response }) => {
      expect(response.statusCode).to.eq(201);
      expect(response.body).to.include({ name: NOMBRE, serialNumber: SERIE, categoryName: 'Hardware' });
    });
    cy.get('.modal').should('not.exist');

    paso(16, 'Buscar el elemento por su número de serie y validar los datos de la fila');
    cy.get('.filters input').type(SERIE);
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('tbody tr', NOMBRE).within(() => {
      cy.get('td').eq(1).should('have.text', 'Hardware');
      cy.get('td').eq(2).should('have.text', 'Disponible');
      cy.get('td').eq(3).should('have.text', '6');
      cy.get('td').eq(4).should('have.text', '2');
      cy.get('td').eq(5).should('have.text', '$1.290.000');
    });
    cy.get('.card__value').first().should('have.text', '1');

    paso(17, 'Eliminar el elemento desde la fila (se acepta la confirmación) y validar que desaparece');
    cy.on('window:confirm', (mensaje) => {
      expect(mensaje).to.eq(`¿Eliminar "${NOMBRE}"?`);
    });
    cy.contains('tbody tr', NOMBRE).find('button[title="Eliminar"]').click();
    // Al eliminar, la lista se recarga sin filtros: vuelven los 15 elementos del seed.
    cy.get('tbody tr').should('have.length', 15);
    cy.contains('tbody tr', NOMBRE).should('not.exist');
    cy.get('.card__value').first().should('have.text', '15');
  });
});
