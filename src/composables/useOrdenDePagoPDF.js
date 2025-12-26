// src/composables/useOrdenDePagoPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useOrdenDePagoPDF() {
  const generatePDF = (ordenDetails) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // --- BLOQUE 1: ENCABEZADO ---
    // (Opcional) Si tienes un logo en base64, puedes añadirlo aquí.
    // const logoBase64 = 'data:image/png;base64,iVBORw0KGgo...';
    // doc.addImage(logoBase64, 'PNG', margin, y - 10, 40, 15);

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Orden de Pago', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setDrawColor(220); // Color gris claro para la línea
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // --- BLOQUE 2: RESUMEN EJECUTIVO ---
    doc.setFontSize(10);
    doc.setTextColor(100); // Color gris para las etiquetas
    doc.text('N° de Orden:', margin, y);
    doc.text('Fecha de Emisión:', pageWidth / 2, y, { align: 'center' });
    doc.text('Monto Total:', pageWidth - margin, y, { align: 'right' });
    
    y += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0); // Color negro para los valores
    doc.text(`${ordenDetails.id}`, margin, y);
    doc.text(`${new Date(ordenDetails.fecha_emision).toLocaleDateString('es-AR', { timeZone: 'UTC' })}`, pageWidth / 2, y, { align: 'center' });
    doc.text(`${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(ordenDetails.monto_total_general)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 15;
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // --- BLOQUE 3: DETALLE DE PAGOS POR INSTRUMENTADOR ---
    ordenDetails.pagos_instrumentadores.forEach(pago => {
      // Encabezado por instrumentador
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Instrumentador: ${pago.instrumentador_nombre}`, margin, y);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Total para este instrumentador: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pago.monto_total_instrumentador)}`, pageWidth - margin, y, { align: 'right' });
      y += 10;

      // Tabla de cirugías para este instrumentador
      const body = pago.cirugias.map(c => [
        new Date(c.fecha_cirugia).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
        c.paciente,
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(c.monto_final)
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Fecha Cirugía', 'Paciente / Procedimiento', 'Monto Pagado']],
        body: body,
        theme: 'striped', // Un tema más limpio que 'grid'
        headStyles: { 
          fillColor: [241, 245, 249], // Un gris muy claro (slate-100)
          textColor: [51, 65, 85], // Un gris oscuro (slate-700)
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
        },
        columnStyles: {
          2: { halign: 'right' } // Alinear la columna de montos a la derecha
        }
      });

      y = doc.lastAutoTable.finalY + 20; // Dejamos más espacio entre instrumentadores
    });

    // Notas al final
    if (ordenDetails.notas) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notas Adicionales:', margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const noteLines = doc.splitTextToSize(ordenDetails.notas, pageWidth - (margin * 2));
      doc.text(noteLines, margin, y);
    }

    doc.save(`OrdenDePago_${ordenDetails.id}.pdf`);
  };

  return { generatePDF };
}