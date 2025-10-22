import React from 'react';
import { useDropzone } from 'react-dropzone';

interface PropsCargaArchivo {
  alCargarArchivo: (archivo: File) => void;
  cargando: boolean;
}

const CargaArchivo: React.FC<PropsCargaArchivo> = ({ alCargarArchivo, cargando }) => {
  const [archivoSeleccionado, setArchivoSeleccionado] = React.useState<File | null>(null);

  const alSoltar = (archivosAceptados: File[]) => {
    if (archivosAceptados.length > 0) {
      setArchivoSeleccionado(archivosAceptados[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive: estaArrastrando, open } = useDropzone({
    onDrop: alSoltar,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const manejarAnalizar = () => {
    if (!archivoSeleccionado) return;
    alCargarArchivo(archivoSeleccionado);
  };

  const manejarTeclaZona = (evento: React.KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      open();
    }
  };

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const unidades = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const valor = bytes / Math.pow(1024, i);
    return `${valor.toFixed(1)} ${unidades[i]}`;
  };

  return (
    <section aria-labelledby="subir-archivo" className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        {/* Overlay de carga */}
        {cargando && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-3xl">
            <div className="flex flex-col items-center gap-4 p-8 bg-slate-900/90 rounded-xl border border-indigo-500/30 shadow-2xl">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <svg className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white mb-1">Analizando tus datos...</p>
                <p className="text-sm text-slate-400">La IA está procesando tu archivo</p>
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 -top-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_minmax(0,390px)]">
          <div className="space-y-6 text-slate-100">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              IA Activa
            </span>
            <div>
              <h3 id="subir-archivo" className="text-3xl font-semibold leading-snug text-white md:text-4xl">
                Carga tus datos y obtén visualizaciones curadas por IA
              </h3>
              <p className="mt-3 max-w-xl text-base text-slate-200/80">
                Aceptamos archivos en formato <span className="font-semibold text-white">.xlsx</span> y <span className="font-semibold text-white">.csv</span> de hasta 10MB. Nuestra IA explorará los patrones y te sugerirá los gráficos más expresivos.
              </p>
            </div>

            <dl className="grid gap-4 text-sm text-slate-200/70 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-xs uppercase tracking-widest text-slate-200/60">Velocidad de análisis</dt>
                <dd className="mt-1 flex items-baseline gap-2 text-lg font-semibold text-emerald-300">
                  <span>&lt; 15s</span>
                  <span className="text-xs font-medium text-slate-200/60">promedio</span>
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-xs uppercase tracking-widest text-slate-200/60">Compatibilidad</dt>
                <dd className="mt-1 text-lg font-semibold text-white">Excel y CSV</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-xs uppercase tracking-widest text-slate-200/60">Seguridad</dt>
                <dd className="mt-1 text-lg font-semibold text-white">Cifrado 256-bit</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-4">
            <div
              {...getRootProps({
                className: `relative flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  estaArrastrando
                    ? 'border-indigo-300 bg-indigo-500/10 shadow-lg shadow-indigo-600/30'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`,
                role: 'button',
                tabIndex: 0,
                onKeyDown: manejarTeclaZona,
                'aria-disabled': cargando,
              })}
            >
              <input {...getInputProps({ 'aria-label': 'Seleccionar archivo' })} />
              <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/40">
                  <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 014-4h9a4 4 0 010 8H7a4 4 0 01-4-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4m0 8l-3-3m3 3l3-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Suelta tu archivo aquí</p>
                  <p className="mt-1 text-sm text-slate-200/70">o utiliza los controles inferiores para explorar tu equipo</p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <button
                    type="button"
                    onClick={open}
                    disabled={cargando}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7h14v11a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
                    </svg>
                    Seleccionar archivo
                  </button>
                  <button
                    onClick={manejarAnalizar}
                    disabled={cargando || !archivoSeleccionado}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
                  >
                    {cargando ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8" strokeWidth="4" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {cargando ? 'Analizando…' : 'Analizar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/80">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-200/50">
                <span>Última selección</span>
                <span>{archivoSeleccionado ? 'Listo para analizar' : 'Pendiente'}</span>
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                {archivoSeleccionado ? (
                  <dl className="space-y-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-white">Nombre</dt>
                      <dd className="truncate pl-4 text-right text-slate-200/80" title={archivoSeleccionado.name}>{archivoSeleccionado.name}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-white">Tamaño</dt>
                      <dd className="text-slate-200/80">{formatearTamano(archivoSeleccionado.size)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-white">Estado</dt>
                      <dd className="flex items-center gap-2 text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                        {cargando ? 'Analizando' : 'Listo'}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-slate-200/60">Aún no has añadido un archivo. Selecciona uno desde tu equipo o arrástralo a la zona superior.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CargaArchivo;