// src/services/reportGeneratorService.js (CON COLORES DE TEXTO FIABLES)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const logoBase64 = ''; // Opcional: Reemplazar con el logo en Base64

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
};

const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return format(adjustedDate, 'dd/MM/yyyy');
};

export function generateTraceabilityReport(reportes, filters = {}) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let currentY = 15;

  if (logoBase64 && logoBase64.length > 100) {
    try { doc.addImage(logoBase64, 'PNG', 14, currentY, 40, 15); } 
    catch (e) { console.error("Error al añadir el logo.", e); }
  }

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text("Reporte de Trazabilidad de Cirugías", pageWidth / 2, currentY + 10, { align: 'center' });
  currentY += 25;
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 10;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Filtros Aplicados:", 14, currentY);
  doc.text("Resumen del Periodo:", pageWidth / 2, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const filterLines = [
    `Paciente: ${filters.paciente || 'Todos'}`, `Médico: ${filters.medico || 'Todos'}`,
    `Estado: ${filters.statusFilter && filters.statusFilter !== 'todos' ? filters.statusFilter : 'Todos'}`,
    `Periodo: ${filters.startDate ? formatDateOnly(filters.startDate) : 'N/A'} - ${filters.endDate ? formatDateOnly(filters.endDate) : 'N/A'}`
  ];
  doc.text(filterLines, 14, currentY);

  const statusCounts = reportes.reduce((acc, r) => { acc[r.estado] = (acc[r.estado] || 0) + 1; return acc; }, {});
  const summaryLines = [
    `Total de Cirugías: ${reportes.length}`, `Enviadas: ${statusCounts['Enviado'] || 0}`,
    `Pendientes: ${statusCounts['Pendiente'] || 0}`, `Expiradas: ${statusCounts['Expirado'] || 0}`,
  ];
  doc.text(summaryLines, pageWidth / 2, currentY);
  currentY += (Math.max(filterLines.length, summaryLines.length) * 5) + 5;

  const tableColumns = [ "ID Reporte", "Paciente", "Médico", "Tipo Cirugía", "Instrumentador", "Fecha Cirugía", "Estado", "Planificado en" ];
  const tableRows = reportes.map(r => [
    r.id, r.paciente || 'N/A', r.medico || 'N/A', r.tipo_cirugia || 'N/A',
    r.instrumentador_completado || 'N/A', formatDateOnly(r.fecha_cirugia),
    r.estado || 'N/A', // Mantenemos el texto original para la lógica de coloreado
    formatDateTime(r.created_at),
  ]);

  autoTable(doc, {
    head: [tableColumns], body: tableRows, startY: currentY, theme: 'grid', autoPaging: 'text',
    styles: { valign: 'middle', fontSize: 8 },
    headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center' 
    },
    // ** LA MEJORA CLAVE ESTÁ AQUÍ **
    // Reintroducimos el coloreado de texto de forma segura.
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 6) { // Columna "Estado"
        const estado = data.cell.raw;
        if (estado === 'Enviado') {
          data.cell.styles.textColor = '#1e8e3e'; // Verde
        } else if (estado === 'Pendiente') {
          data.cell.styles.textColor = '#f9ab00'; // Naranja
        } else if (estado === 'Expirado') {
          data.cell.styles.textColor = '#d93025'; // Rojo
        }
      }
    },
    didDrawPage: (data) => {
      doc.setFontSize(10); doc.setTextColor(150);
      const pageCount = doc.internal.getNumberOfPages();
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      doc.text('Reporte de Trazabilidad - Gestion IQ', 14, pageHeight - 10);
    },
  });

  doc.save(`Reporte_Trazabilidad_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}