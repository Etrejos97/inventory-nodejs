// Fuente única de los casos para TestRail. Cada paso replica, en el mismo orden,
// el "Paso N" del spec de Cypress correspondiente.
// Los archivos de importación se generan con: node testrail/generar.js

const PRECONDICION_BASE =
  'Backend en http://localhost:8080 y frontend en http://localhost:5173 en ejecución, ' +
  'con la base sembrada (15 elementos, usuario admin / admin123 activo con rol Administrador).';

module.exports = [
  {
    id: 'TC-AUTO-01',
    titulo: 'TC-AUTO-01 · Autenticación en /login',
    url: 'http://localhost:5173/login',
    referencias: 'RF-07, CU-06',
    spec: 'e2e/cypress/e2e/01-login.cy.js',
    precondiciones: `${PRECONDICION_BASE} Sin sesión iniciada.`,
    pasos: [
      ['Abrir http://localhost:5173/login.', 'Se muestra la pantalla de inicio de sesión.'],
      ['Validar el título de la pestaña.', 'El título es "Inventory - Iniciar sesión".'],
      ['Validar la URL de la página.', 'La URL es http://localhost:5173/login.'],
      [
        'Verificar los elementos presentes de la pantalla.',
        'Se ven el logo, el título, el subtítulo, el campo Usuario (placeholder "Nombre de usuario"), el campo Contraseña (placeholder "••••••••"), el botón para mostrar la contraseña, el botón "Iniciar sesión" y el botón "Volver al inicio". No hay mensaje de error.',
      ],
      [
        'Validar los textos de la pantalla.',
        'El título dice "Inventory", el subtítulo "Inicia sesión para administrar", las etiquetas "Usuario" y "Contraseña" y el botón "Iniciar sesión".',
      ],
      [
        'Validar los estilos CSS.',
        'La fuente del body es Inter y su fondo es rgb(10, 14, 23). La tarjeta tiene fondo rgb(17, 24, 39). El título tiene color rgb(241, 245, 249) y peso 700. El botón tiene color rgb(10, 14, 23), borde redondeado de 10px y fondo con degradado lineal.',
      ],
      [
        'Presionar "Iniciar sesión" con el formulario vacío.',
        'El navegador marca el usuario como obligatorio, no se llama a la API y la URL sigue en /login.',
      ],
      [
        'Escribir el usuario "admin" y la contraseña "incorrecta123". Presionar el botón del ojo y presionarlo otra vez.',
        'La contraseña se muestra en texto y luego vuelve a ocultarse.',
      ],
      [
        'Presionar "Iniciar sesión".',
        'La API responde 401 y se muestra "Credenciales inválidas" en color rgb(255, 45, 85). La URL sigue en /login.',
      ],
      [
        'Borrar la contraseña, escribir "admin123" y presionar "Iniciar sesión".',
        'Se envía el formulario con las credenciales válidas.',
      ],
      [
        'Validar la respuesta de la API.',
        'La API responde 200 con username "admin", role "Administrador" e isActive true.',
      ],
      ['Validar la URL de la página.', 'La URL es http://localhost:5173/inventario.'],
      ['Validar el título de la pestaña.', 'El título es "Inventory - Inventario".'],
      [
        'Validar la barra superior.',
        'Se ven el nombre "Administrador" y el botón "Salir". No aparece "Ingresar". El localStorage guarda el usuario con rol Administrador.',
      ],
      [
        'Presionar "Salir".',
        'La URL es http://localhost:5173/, el título es "Inventory - Gestor de Inventario", aparece el botón "Ingresar" y se borra la sesión del localStorage.',
      ],
    ],
  },
  {
    id: 'TC-AUTO-02',
    titulo: 'TC-AUTO-02 · Registro y consulta en /inventario',
    url: 'http://localhost:5173/inventario',
    referencias: 'RF-01, RF-02, CU-01, CU-02',
    spec: 'e2e/cypress/e2e/02-inventario.cy.js',
    precondiciones: `${PRECONDICION_BASE} No existe ningún elemento con el número de serie LG-UG27-QHD-014.`,
    pasos: [
      ['Iniciar sesión como Administrador y abrir http://localhost:5173/inventario.', 'Se muestra la pantalla de inventario.'],
      ['Validar el título de la pestaña.', 'El título es "Inventory - Inventario".'],
      ['Validar la URL de la página.', 'La URL es http://localhost:5173/inventario.'],
      [
        'Verificar los elementos presentes de la pantalla.',
        'Se ven los botones "Inventario", "Admin" y "Salir", el título "Inventario", el botón "+ Nuevo elemento", el cuadro "Buscar…", dos listas desplegables, 4 tarjetas resumen y una tabla de 7 columnas.',
      ],
      [
        'Validar los textos.',
        'Las tarjetas dicen Productos, Stock total, Stock bajo y Sin stock. Los encabezados son Producto, Categoría, Estado, Stock, Stock mín., Valor y Acciones. La tabla tiene 15 filas y la tarjeta Productos muestra 15.',
      ],
      [
        'Validar los estilos CSS.',
        'El botón "Inventario" está activo con color rgb(0, 240, 255). "+ Nuevo elemento" tiene color rgb(10, 14, 23), peso 600 y fondo con degradado. Los encabezados tienen color rgb(100, 116, 139) y mayúsculas. El valor de las tarjetas mide 28px, peso 700 y color rgb(241, 245, 249).',
      ],
      [
        'Abrir las listas desplegables de categoría y de estado.',
        'Categoría: Todas las categorías, Hardware, Software, Licencias, Redes, Consumibles, Gaming y Audio y Video. Estado: Todos los estados, Disponible, En uso, En mantenimiento y Dado de baja.',
      ],
      [
        'Seleccionar la categoría Hardware.',
        'La tabla queda con 6 filas y todas tienen la categoría Hardware.',
      ],
      [
        'Seleccionar además el estado Disponible.',
        'Los filtros se combinan: quedan 3 filas y todas tienen el estado Disponible.',
      ],
      [
        'Volver a "Todas las categorías" y "Todos los estados". Escribir "laptop" en el cuadro de búsqueda, borrarlo y escribir "LAPTOP".',
        'Vuelven las 15 filas. Con "laptop" y con "LAPTOP" quedan las mismas 2 filas, cuyo nombre contiene "Laptop".',
      ],
      [
        'Escribir "zzz-no-existe" en el cuadro de búsqueda y luego borrarlo.',
        'La tabla muestra "No hay elementos registrados" y, al borrar el texto, vuelven las 15 filas.',
      ],
      [
        'Presionar "+ Nuevo elemento".',
        'Se abre el formulario "Nuevo elemento" con los campos nombre, categoría (Seleccionar… más las 7 categorías), estado (4 opciones), número de serie, fecha de adquisición, ubicación, valor, stock, stock mínimo, descripción y los botones Cancelar y Crear.',
      ],
      [
        'Presionar "Crear" sin llenar ningún campo.',
        'El navegador marca el nombre y la categoría como obligatorios, no se llama a la API y el formulario sigue abierto.',
      ],
      [
        'Llenar el formulario con nombre Monitor LG UltraGear 27" QHD, categoría Hardware, estado Disponible, número de serie TPLINK-AX73-001 (ya registrado), fecha 2026-08-20, ubicación Bodega A - E5, valor 1290000, stock 6, stock mínimo 2 y descripción 27" QHD 165Hz, panel IPS, HDR10. Presionar "Crear".',
        'La API responde 409 y el formulario muestra "Ya existe un ítem con número de serie: TPLINK-AX73-001". El formulario sigue abierto.',
      ],
      [
        'Cambiar el número de serie por LG-UG27-QHD-014 y presionar "Crear".',
        'La API responde 201 con el elemento creado y el formulario se cierra.',
      ],
      [
        'Buscar LG-UG27-QHD-014 en el cuadro de búsqueda.',
        'Queda una fila con Monitor LG UltraGear 27" QHD, categoría Hardware, estado Disponible, stock 6, stock mínimo 2 y valor $1.290.000. La tarjeta Productos muestra 1.',
      ],
      [
        'Presionar el ícono de eliminar de esa fila y aceptar la confirmación ¿Eliminar "Monitor LG UltraGear 27" QHD"?.',
        'El elemento desaparece, la lista vuelve a las 15 filas del seed y la tarjeta Productos muestra 15.',
      ],
    ],
  },
  {
    id: 'TC-AUTO-03',
    titulo: 'TC-AUTO-03 · Catálogo público en /',
    url: 'http://localhost:5173/',
    referencias: 'RF-02',
    spec: 'e2e/cypress/e2e/03-catalogo.cy.js',
    precondiciones: `${PRECONDICION_BASE} Sin sesión iniciada y carrito vacío. Cobertura adicional de RF-02: consulta pública del inventario por categoría.`,
    pasos: [
      ['Abrir http://localhost:5173/ sin sesión iniciada.', 'Se muestra la página pública con el catálogo.'],
      ['Validar el título de la pestaña.', 'El título es "Inventory - Gestor de Inventario".'],
      ['Validar la URL de la página.', 'La URL es http://localhost:5173/.'],
      [
        'Verificar los elementos presentes de la pantalla.',
        'Se ven el logo INVENTORY, los botones "Inicio", "Ingresar" y el carrito, la insignia, el título y el botón "Gaming" del encabezado, el enlace "Ver productos", las pestañas de categoría y la cuadrícula de productos.',
      ],
      [
        'Validar los textos del encabezado.',
        'Se leen "INVENTORY", "Ofertas exclusivas", "Tecnología que impulsa tu mundo", "Descubre los mejores equipos" y los beneficios Envío nacional, Pago seguro, Soporte 24/7 y Garantía incluida.',
      ],
      [
        'Validar los estilos CSS.',
        'El logo tiene peso 800 y cursor pointer. "Inicio" está activo con color rgb(0, 240, 255). El título principal mide 44px con peso 900. El subtítulo tiene color rgb(148, 163, 184) y 16.8px. La pestaña "Todos" está activa con color rgb(10, 14, 23) y borde redondeado de 999px.',
      ],
      [
        'Revisar las pestañas de categoría y la cantidad de productos.',
        'Las pestañas son Todos, Hardware, Software, Licencias, Redes, Consumibles, Gaming y Audio y Video. Se muestran 15 tarjetas de producto.',
      ],
      [
        'Revisar la imagen de cada producto.',
        'Hay 15 imágenes y cada una tiene como texto alternativo el nombre de su producto.',
      ],
      [
        'Presionar la pestaña "Software".',
        'La pestaña queda activa, no hay tarjetas y se muestra "No hay productos en esta categoría".',
      ],
      [
        'Presionar la pestaña "Redes".',
        'Queda una tarjeta: Router TP-Link Archer AX73, categoría Redes, precio $299.900, "10 en stock" y el botón "Agregar al carrito" habilitado.',
      ],
      [
        'Presionar "Agregar al carrito".',
        'El contador del carrito en la barra superior pasa a 1.',
      ],
      [
        'Presionar el botón del carrito.',
        'Se abre el panel "Carrito (1)" con Router TP-Link Archer AX73, cantidad 1 y total $299.900.',
      ],
      [
        'Presionar el botón + de la cantidad.',
        'La cantidad pasa a 2, el total a $599.800 y el título a "Carrito (2)".',
      ],
      [
        'Presionar "Solicitar cotización".',
        'Se abre "Resumen de cotización" con "Router TP-Link Archer AX73 × 2" y $599.800.',
      ],
      [
        'Presionar "Confirmar cotización".',
        'Se muestra "¡Cotización solicitada!" en color rgb(34, 214, 94) y "Te contactaremos pronto con los detalles.". El panel se cierra solo y el carrito queda vacío.',
      ],
      [
        'Presionar "Ingresar".',
        'La URL pasa a http://localhost:5173/login y el título a "Inventory - Iniciar sesión".',
      ],
    ],
  },
];
