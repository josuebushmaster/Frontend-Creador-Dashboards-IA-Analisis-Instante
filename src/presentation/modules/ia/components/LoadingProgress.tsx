import React from 'react';
import type { EstadoCarga } from '../hooks/useAnalisis';

interface LoadingProgressProps {
  estadoCarga: EstadoCarga;
  progreso: number;
  tiempoEstimado: number | null;
  onCancelar?: () => void;
}

const ICONOS_ESTADO = {
  idle: null,
  uploading: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  ),
  processing: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  analyzing: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  generating: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  completed: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const MENSAJES_ESTADO = {
  idle: 'Esperando...',
  uploading: 'Subiendo archivo...',
  processing: 'Procesando datos...',
  analyzing: 'Generando insights con IA...',
  generating: 'Preparando visualizaciones...',
  completed: 'Análisis completado',
};

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  estadoCarga,
  progreso,
  tiempoEstimado,
  onCancelar,
}) => {
  const formatearTiempo = (ms: number): string => {
    const segundos = Math.ceil(ms / 1000);
    if (segundos < 60) return `${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}m ${segs}s`;
  };

  if (estadoCarga === 'idle' || estadoCarga === 'completed') return null;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur">
        {/* Icono animado */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
          <div className="animate-pulse">
            {ICONOS_ESTADO[estadoCarga]}
          </div>
        </div>

        {/* Mensaje de estado */}
        <h3 className="mb-2 text-lg font-semibold text-white">
          {MENSAJES_ESTADO[estadoCarga]}
        </h3>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-slate-300">
            <span>{progreso}%</span>
            {tiempoEstimado && (
              <span>≈ {formatearTiempo(tiempoEstimado)}</span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ transform: `translateX(-${100 - progreso}%)` }}
            />
          </div>
        </div>

        {/* Botón cancelar */}
        {onCancelar && (
          <button
            onClick={onCancelar}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingProgress;