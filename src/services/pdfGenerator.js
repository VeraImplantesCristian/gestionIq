// src/services/pdfGenerator.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateIncidencesPDF(incidencias) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const columns = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Tipo', dataKey: 'tipo' },
    { header: 'Instrumentador', dataKey: 'instrumentador' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Reportado Por', dataKey: 'reportado_por' },
  ];

  const body = incidencias.map(inc => ({
    fecha: new Date(inc.created_at).toLocaleDateString(),
    tipo: inc.tipo,
    instrumentador: inc.instrumentadores?.nombre_completo || 'N/A',
    estado: inc.estado,
    reportado_por: inc.reportado_por || 'N/A',
    // --- NUEVO ---
    // Añadimos la descripción a nuestros datos procesados.
    descripcion: inc.descripcion || 'Sin descripción.',
  }));

  doc.setFontSize(16);
  doc.text('Reporte de Incidencias', 14, 15);

  autoTable(doc, {
    head: [columns.map(c => c.header)],
    // El body ahora solo contiene los datos de las columnas principales.
    body: body.map(row => columns.map(col => row[col.dataKey])),
    startY: 20,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [41, 128, 185], // Un azul más corporativo
      fontSize: 9,
    },
    // --- LA MAGIA OCURRE AQUÍ ---
    // 'didDrawCell' es una función que se ejecuta después de dibujar cada celda.
    // La usaremos para añadir la descripción debajo de cada fila.
    didDrawPage: (data) => {
      // Esto asegura que el título se repita en cada nueva página si la tabla es muy larga.
      doc.setFontSize(16);
      doc.text('Reporte de Incidencias', 14, 15);
    },
    didParseCell: function (data) {
      // Si la celda es la primera de la fila ('Fecha'), añadimos un margen inferior
      // para dar espacio a la descripción que vamos a dibujar.
      if (data.column.dataKey === 'fecha') {
        data.cell.styles.cellPadding = { top: 2, right: 2, bottom: 10, left: 2 };
      }
    },
    didDrawCell: function (data) {
      // Solo actuamos sobre la primera celda de cada fila y no en la cabecera.
      if (data.section === 'body' && data.column.index === 0) {
        // Obtenemos la descripción completa de la fila actual.
        const descripcion = body[data.row.index].descripcion;
        
        // Configuramos el estilo para el texto de la descripción.
        doc.setFontSize(7);
        doc.setTextColor(120); // Un gris suave

        // Usamos 'splitTextToSize' para manejar textos largos y que se ajusten al ancho de la tabla.
        const textLines = doc.splitTextToSize(
          `Descripción: ${descripcion}`,
          doc.internal.pageSize.width - data.cell.x * 2 // Ancho de la página menos los márgenes
        );

        // Dibujamos el texto debajo de la celda actual.
        doc.text(textLines, data.cell.x, data.cell.y + 8);

        // Restauramos el color del texto para el resto de la tabla.
        doc.setTextColor(40);
      }
    },
  });

  doc.save(`reporte_incidencias_${new Date().toISOString().slice(0, 10)}.pdf`);
}