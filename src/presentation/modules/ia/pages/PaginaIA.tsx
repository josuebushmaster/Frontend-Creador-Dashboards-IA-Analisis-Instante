import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { CargaArchivo, TarjetaAnalisis } from '../components/index.ts';
import GraficoRecharts from '../components/GraficoRecharts';
import ToastContainer, { ToastItem } from '../components/Toast';
import { useAnalisis } from '../hooks/index.ts';
import type { Grafico, SugerenciaAnalisis } from '../../../../domain/entities/Analisis.ts';

const CuadriculaResponsiva = WidthProvider(Responsive);

const PASOS_PROCESO: Array<{ titulo: string; descripcion: string }> = [
  {
    titulo: 'Carga sencilla',
    descripcion: 'Arrastra archivos .xlsx o .csv y nuestro motor validará la calidad de los datos en segundos.',
  },
  {
    titulo: 'Análisis con IA',
    descripcion: 'Detectamos correlaciones, métricas clave y sugerimos los gráficos más expresivos para tu contexto.',
  },
  {
    titulo: 'Dashboard interactivo',
    descripcion: 'Ordena tarjetas y visualizaciones con drag-and-drop y conserva una historia de datos viva.',
  },
];

const PaginaIA: React.FC = () => {
  const {
    cargando,
    error,
    sugerencias,
    resultado,
    analizarArchivo,
    obtenerDatosGrafico,
    limpiarEstado,
  } = useAnalisis();

  const [archivoSubido, setArchivoSubido] = useState(false);
  const [graficosDelDashboard, setGraficosDelDashboard] = useState<Grafico[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const limpiarTodo = () => {
    setGraficosDelDashboard([]);
    setArchivoSubido(false);
    limpiarEstado();
  };

  const limpiarDashboards = () => {
    setGraficosDelDashboard([]);
  };

  const manejarCargaArchivo = async (archivo: File) => {
    try {
      setArchivoSubido(false);
      await analizarArchivo(archivo);
      setArchivoSubido(true);
      // Notificar al usuario
      const id = `t-${Date.now()}`;
      setToasts(prev => [...prev, { id, message: 'Archivo analizado con éxito', type: 'success' }]);
      // auto remove
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    } catch (err) {
      console.error('Error al analizar archivo:', err);
      const id = `te-${Date.now()}`;
      setToasts(prev => [...prev, { id, message: 'Error al analizar archivo', type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }
  };

  const mapearTipoBackend = (tipo: SugerenciaAnalisis['tipoGrafico']): string => {
    switch (tipo) {
      case 'barras':
        return 'bar';
      case 'lineas':
        return 'line';
      case 'pastel':
        return 'pie';
      case 'area':
        return 'area';
      case 'scatter':
        return 'scatter';
      case 'radar':
        return 'radar';
      default:
        return 'bar';
    }
  };

  const manejarAgregarAlDashboard = async (sugerencia: SugerenciaAnalisis) => {
    try {
      if (!resultado?.archivoId) return;

      console.log('🎯 Agregando al dashboard:', {
        titulo: sugerencia.titulo,
        tipo: sugerencia.tipoGrafico,
        tipoBackend: sugerencia.configuracion.tipoBackend,
        ejeX: sugerencia.configuracion.ejeX,
        ejeY: sugerencia.configuracion.ejeY,
      });

      if (!sugerencia.configuracion.ejeX) {
        throw new Error('La sugerencia no tiene columna definida para el eje X');
      }

      const tipoBackend = sugerencia.configuracion.tipoBackend || mapearTipoBackend(sugerencia.tipoGrafico);
      
      const parametros = {
        eje_x: sugerencia.configuracion.ejeX,
        eje_y: sugerencia.configuracion.ejeY || undefined,
      };

      console.log('📤 Enviando al backend:', { tipoBackend, parametros });

      const datos = await obtenerDatosGrafico(resultado.archivoId, tipoBackend, parametros);

      // Validar que los datos son válidos antes de renderizar el gráfico
      if (!datos || !datos.datos || !Array.isArray(datos.datos) || datos.datos.length === 0) {
        console.warn('⚠️ Datos del gráfico vacíos o inválidos:', datos);
        const id = `te-${Date.now()}`;
        setToasts(prev => [...prev, { id, message: 'No hay datos suficientes para generar el gráfico', type: 'error' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
        return;
      }

      const idUnico = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const nuevoGrafico: Grafico = {
        id: idUnico,
        titulo: sugerencia.titulo,
        tipo: sugerencia.tipoGrafico,
        configuracion: {
          ...sugerencia.configuracion,
          datos: datos.datos,
        },
      };

      setGraficosDelDashboard(prev => [...prev, nuevoGrafico]);
      const id = `tg-${Date.now()}`;
      setToasts(prev => [...prev, { id, message: 'Gráfico agregado al dashboard', type: 'success' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    } catch (err) {
      console.error('Error al obtener datos del gráfico:', err);
      const id = `teg-${Date.now()}`;
      setToasts(prev => [...prev, { id, message: 'Error al obtener datos del gráfico', type: 'error' }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }
  };

  const generarDisposicion = () =>
    graficosDelDashboard.map((grafico, indice) => ({
      i: grafico.id,
      x: (indice * 4) % 12,
      y: Math.floor(indice / 3) * 4,
      w: 4,
      h: 4,
    }));

  return (
    <div className="space-y-12">
      {error && (
        <div className="flex items-start space-x-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-100 shadow-lg shadow-rose-500/20">
          <svg className="mt-0.5 h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-base font-semibold text-white">Error al procesar el archivo</h3>
            <p className="mt-1 text-sm text-rose-100/80">{error}</p>
          </div>
        </div>
      )}

      {!archivoSubido && sugerencias.length === 0 && !error && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-xl shadow-cyan-500/10 backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),transparent_60%)]" aria-hidden />
          <div className="relative mx-auto max-w-3xl space-y-4">
            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Bienvenido
            </span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Construye visualizaciones elegantes sin esfuerzo
            </h2>
            <p className="text-base text-slate-200/80">
              Carga un archivo y deja que la IA convierta tus datos en historias memorables. Sugerimos visualizaciones, aplicamos mejores prácticas y te permitimos construir dashboards interactivos en cuestión de segundos.
            </p>
          </div>
        </section>
      )}

      <CargaArchivo alCargarArchivo={manejarCargaArchivo} cargando={cargando} />

      {!archivoSubido && sugerencias.length === 0 && !error && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-100 shadow-xl shadow-indigo-500/10 backdrop-blur">
          <h3 className="text-center text-lg font-semibold text-white sm:text-xl">Cómo funciona</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PASOS_PROCESO.map((paso, indice) => (
              <div key={paso.titulo} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:scale-110" aria-hidden />
                <div className="relative flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-200">
                    {indice + 1}
                  </div>
                </div>
                <h4 className="relative mt-4 text-lg font-semibold text-white">{paso.titulo}</h4>
                <p className="relative mt-2 text-sm text-slate-200/70">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sugerencias.length > 0 && (
        <section className="animate-fadeIn">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-white sm:text-3xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.12 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
                  </svg>
                </span>
                Sugerencias de análisis
              </h2>
              <p className="text-sm text-slate-200/70">
                Nuestra IA encontró {sugerencias.length} idea{sugerencias.length !== 1 ? 's' : ''} para potenciar tu historia con datos.
              </p>
            </div>
            <button
              onClick={limpiarTodo}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-linear-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar todo
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sugerencias.map((sugerencia, idx) => (
              <TarjetaAnalisis
                key={sugerencia.id}
                titulo={sugerencia.titulo}
                analisis={sugerencia.descripcion}
                alAgregarAlDashboard={() => manejarAgregarAlDashboard(sugerencia)}
                animationDelay={idx * 90}
              />
            ))}
          </div>
        </section>
      )}

      {graficosDelDashboard.length > 0 && (
        <section className="animate-fadeIn">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-white sm:text-3xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4.5h4v15H3zm7 0h5v9h-5zm7 0h4v6h-4z" />
                  </svg>
                </span>
                Dashboard interactivo
              </h2>
              <p className="text-sm text-slate-200/70">
                {graficosDelDashboard.length} gráfico{graficosDelDashboard.length !== 1 ? 's' : ''} agregado{graficosDelDashboard.length !== 1 ? 's' : ''}. Reorganiza con drag-and-drop y construye tu narrativa.
              </p>
            </div>
            <button
              onClick={limpiarDashboards}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-linear-to-r from-rose-500 to-pink-500 text-white font-medium shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Borrar dashboard
            </button>
          </div>
          <CuadriculaResponsiva
            className="layout"
            layouts={{ lg: generarDisposicion() }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            draggableHandle=".drag-handle"
          >
            {graficosDelDashboard.map(grafico => (
              <div
                key={grafico.id}
                className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/80 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur transition hover:border-indigo-200"
              >
                <div className="drag-handle mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    {grafico.titulo}
                  </h3>
                  <button
                    title="Eliminar gráfico"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-rose-100 hover:text-rose-500"
                    onClick={() => setGraficosDelDashboard(prev => prev.filter(g => g.id !== grafico.id))}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <GraficoRecharts grafico={grafico} />
                </div>
              </div>
            ))}
          </CuadriculaResponsiva>
        </section>
      )}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default PaginaIA;