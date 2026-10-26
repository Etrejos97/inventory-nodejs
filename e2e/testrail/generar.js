// Genera los archivos para importar los casos en TestRail:
//   - inventory-app-casos.xml  (plantilla "Test Case (Steps)", un paso por fila)
//   - inventory-app-casos.csv  (plantilla "Test Case (Text)", pasos numerados en un campo)
// Uso: node testrail/generar.js

const fs = require('fs');
const path = require('path');
const casos = require('./casos');

const SECCION = 'Pruebas automatizadas E2E (Cypress)';
const salida = __dirname;

const xml = (texto) =>
  String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function generarXml() {
  const items = casos
    .map((c) => {
      const pasos = c.pasos
        .map(
          ([paso, esperado], i) =>
            `            <step>\n              <index>${i + 1}</index>\n              <content>${xml(paso)}</content>\n              <expected>${xml(esperado)}</expected>\n            </step>`,
        )
        .join('\n');
      return `      <case>
        <title>${xml(c.titulo)}</title>
        <template>Test Case (Steps)</template>
        <references>${xml(c.referencias)}</references>
        <custom>
          <preconds>${xml(c.precondiciones)}</preconds>
          <steps_separated>
${pasos}
          </steps_separated>
        </custom>
      </case>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sections>
  <section>
    <name>${xml(SECCION)}</name>
    <description>Casos automatizados con Cypress. Código en la carpeta e2e del repositorio.</description>
    <cases>
${items}
    </cases>
  </section>
</sections>
`;
}

const csvCelda = (texto) => `"${String(texto).replace(/"/g, '""')}"`;

function generarCsv() {
  const cabecera = ['Section', 'Title', 'Template', 'References', 'Preconditions', 'Steps', 'Expected Result'];
  const filas = casos.map((c) => {
    const pasos = c.pasos.map(([paso], i) => `${i + 1}. ${paso}`).join('\n');
    const esperado = c.pasos.map(([, resultado], i) => `${i + 1}. ${resultado}`).join('\n');
    return [SECCION, c.titulo, 'Test Case (Text)', c.referencias, c.precondiciones, pasos, esperado];
  });
  const lineas = [cabecera, ...filas].map((fila) => fila.map(csvCelda).join(','));
  // BOM para que TestRail y Excel lean bien las tildes.
  return `﻿${lineas.join('\r\n')}\r\n`;
}

fs.writeFileSync(path.join(salida, 'inventory-app-casos.xml'), generarXml(), 'utf8');
fs.writeFileSync(path.join(salida, 'inventory-app-casos.csv'), generarCsv(), 'utf8');

casos.forEach((c) => console.log(`${c.id}: ${c.pasos.length} pasos`));
console.log('Archivos generados en', salida);
