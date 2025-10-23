import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportControlsProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  graficosCount: number;
}

const ExportControls: React.FC<ExportControlsProps> = ({ dashboardRef, graficosCount }) => {
  const [exportando, setExportando] = useState(false);
  const [tipoExport, setTipoExport] = useState<'png' | 'pdf' | null>(null);

  const exportarToPNG = async () => {
    if (!dashboardRef.current) return;
    
    setExportando(true);
    setTipoExport('png');
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0f172a', // Fondo oscuro como la app
        scale: 2, // Alta resolución
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al exportar PNG:', error);
    } finally {
      setExportando(false);
      setTipoExport(null);
    }
  };

  const exportarToPDF = async () => {
    if (!dashboardRef.current) return;
    
    setExportando(true);
    setTipoExport('pdf');
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0f172a',
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setExportando(false);
      setTipoExport(null);
    }
  };

  const compartirURL = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dashboard de Análisis',
          text: `Mira este dashboard con ${graficosCount} visualizaciones`,
          url: url,
        });
      } catch (error) {
        // Usuario canceló o error, copiar al clipboard como fallback
        await navigator.clipboard.writeText(url);
      }
    } else {
      // Fallback: copiar al clipboard
      await navigator.clipboard.writeText(url);
    }
  };

  if (graficosCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
          {graficosCount}
        </span>
        <span>gráfico{graficosCount !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="h-4 w-px bg-white/20" aria-hidden="true" />
      
      <div className="flex gap-2">
        <button
          onClick={exportarToPNG}
          disabled={exportando}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-50"
          title="Exportar como imagen PNG"
        >
          {exportando && tipoExport === 'png' ? (
            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.5L12 8l5.5 4H19v5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4m0 0l4 4m-4-4v12" />
            </svg>
          )}
          PNG
        </button>
        
        <button
          onClick={exportarToPDF}
          disabled={exportando}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
          title="Exportar como documento PDF"
        >
          {exportando && tipoExport === 'pdf' ? (
            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.5L12 8l5.5 4H19v5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          PDF
        </button>
        
        <button
          onClick={compartirURL}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20 hover:text-blue-300"
          title="Compartir enlace del dashboard"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
};

export default ExportControls;