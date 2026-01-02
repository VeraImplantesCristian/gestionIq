// src/composables/useOrdenDePagoPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useOrdenDePagoPDF() {
  const generatePDF = (ordenDetails) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 0; // Se inicia en 0 para un control más preciso

    // --- INICIO DE LA MODIFICACIÓN ---

    // --- DATOS DE LA EMPRESA (RELLENAR) ---
    const empresa = {
      nombre: "DISTRICORR SRL",
      cuit: "CUIT: 30-71598290-7",
      direccion: "9 de julio 1251, Corrientes Capital",
      contacto: "Email: ventas@districorr.com "
    };

    // --- FUNCIÓN HELPER PARA EL PIE DE PÁGINA ---
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150);

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Línea superior del footer
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        
        // Resumen de totales
        const summaryText = `Resumen: ${ordenDetails.pagos_instrumentadores.length} Instrumentador(es) | ${ordenDetails.pagos_instrumentadores.reduce((acc, p) => acc + p.cirugias.length, 0)} Cirugía(s) Totales`;
        doc.text(summaryText, margin, pageHeight - 18);

        // Número de página
        const pageNumText = `Página ${i} de ${pageCount}`;
        doc.text(pageNumText, pageWidth - margin, pageHeight - 18, { align: 'right' });
      }
    };

    // --- BLOQUE 1: CABECERA PROFESIONAL ---
    y = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(empresa.nombre, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(empresa.cuit, margin, y + 5);
    doc.text(empresa.direccion, margin, y + 9);
    doc.text(empresa.contacto, margin, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Orden de Pago', pageWidth - margin, y, { align: 'right' });
    y += 20;

    // --- BLOQUE 2: RESUMEN EJECUTIVO MEJORADO ---
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('N° de Orden:', margin, y);
    doc.text('Fecha de Emisión:', pageWidth / 2, y, { align: 'center' });
    doc.text('Monto Total:', pageWidth - margin, y, { align: 'right' });
    
    y += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`#${ordenDetails.id}`, margin, y);
    doc.text(`${new Date(ordenDetails.fecha_emision).toLocaleDateString('es-AR', { timeZone: 'UTC' })}`, pageWidth / 2, y, { align: 'center' });
    doc.text(`${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(ordenDetails.monto_total_general)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 15;

    // --- BLOQUE 3: DETALLE DE PAGOS CON TABLA ENRIQUECIDA ---
    ordenDetails.pagos_instrumentadores.forEach(pago => {
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Instrumentador: ${pago.instrumentador_nombre}`, margin, y);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Total para este instrumentador: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(pago.monto_total_instrumentador)}`, pageWidth - margin, y, { align: 'right' });
      y += 10;

      // Se mapean los datos para la nueva tabla, incluyendo el 'id_cirugia'.
      const body = pago.cirugias.map(c => [
        c.id_cirugia, // Nueva columna
        new Date(c.fecha_cirugia).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
        c.paciente,
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(c.monto_final)
      ]);

      autoTable(doc, {
        startY: y,
        // Se añade la nueva cabecera 'ID Cirugía'.
        head: [['ID Cirugía', 'Fecha', 'Paciente / Procedimiento', 'Monto Pagado']],
        body: body,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 51, 61], // Color oscuro (slate-800)
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Ancho fijo para ID Cirugía
          3: { halign: 'right' } // Alinear montos a la derecha
        }
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    // --- BLOQUE 4: NOTAS ADICIONALES ---
    if (ordenDetails.notas) {
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
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

    // --- BLOQUE 5: PIE DE PÁGINA ---
    addFooter();

    // --- FIN DE LA MODIFICACIÓN ---

    doc.save(`OrdenDePago_${ordenDetails.id}.pdf`);
  };

  return { generatePDF };
}