import { useState, useEffect, useRef } from 'react';
import type { ResultadoAnalisis, SugerenciaAnalisis, Grafico } from '../../../../domain/entities/Analisis';
import { subirArchivo, obtenerDatosGrafico as obtenerDatosGraficoAPI } from '../../../../infrastructure/api/analisisAPI';

export type EstadoCarga = 'idle' | 'uploading' | 'processing' | 'analyzing' | 'generating' | 'completed';

export interface Estado {
  cargando: boolean;
  estadoCarga: EstadoCarga;
  progreso: number;
  tiempoEstimado: number | null;
  error: string | null;
  resultado: ResultadoAnalisis | null;
  sugerencias: SugerenciaAnalisis[];
  graficos: Grafico[];
}

const ESTADOS_CARGA = {
  idle: 'Esperando...',
  uploading: 'Subiendo archivo...',
  processing: 'Procesando datos...',
  analyzing: 'Generando insights con IA...',
  generating: 'Preparando visualizaciones...',
  completed: 'Análisis completado'
};

// Hook para persistencia en localStorage
const usePersistentState = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setPersistentState = (value: T) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
      setState(value);
    }
  };

  return [state, setPersistentState];
};

export const useAnalisis = () => {
  const [estado, setEstado] = useState<Estado>({
    cargando: false,
    estadoCarga: 'idle',
    progreso: 0,
    tiempoEstimado: null,
    error: null,
    resultado: null,
    sugerencias: [],
    graficos: [],
  });

  const [graficos, setGraficos] = usePersistentState<Grafico[]>('dashboard-graficos', []);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Simular progreso durante la carga
  const simularProgreso = (duracion: number) => {
    const pasos = [
      { estado: 'uploading' as EstadoCarga, progreso: 20, tiempo: duracion * 0.2 },
      { estado: 'processing' as EstadoCarga, progreso: 40, tiempo: duracion * 0.3 },
      { estado: 'analyzing' as EstadoCarga, progreso: 70, tiempo: duracion * 0.3 },
      { estado: 'generating' as EstadoCarga, progreso: 90, tiempo: duracion * 0.15 },
      { estado: 'completed' as EstadoCarga, progreso: 100, tiempo: duracion * 0.05 },
    ];

    let tiempoTranscurrido = 0;
    pasos.forEach((paso) => {
      setTimeout(() => {
        setEstado(prev => ({
          ...prev,
          estadoCarga: paso.estado,
          progreso: paso.progreso,
          tiempoEstimado: duracion - tiempoTranscurrido,
        }));
      }, tiempoTranscurrido);
      tiempoTranscurrido += paso.tiempo;
    });
  };

  const analizarArchivo = async (archivo: File) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setEstado(prev => ({
      ...prev,
      cargando: true,
      estadoCarga: 'uploading',
      progreso: 0,
      tiempoEstimado: 8000, // 8 segundos estimados
      error: null,
    }));

    // Simular progreso
    simularProgreso(8000);

    try {
      const { resultado, sugerencias } = await subirArchivo(archivo);
      
      setEstado(prev => ({
        ...prev,
        cargando: false,
        estadoCarga: 'completed',
        progreso: 100,
        tiempoEstimado: null,
        error: null,
        resultado,
        sugerencias,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request cancelado, no actualizar estado
      }
      
      setEstado(prev => ({
        ...prev,
        cargando: false,
        estadoCarga: 'idle',
        progreso: 0,
        tiempoEstimado: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  const cancelarAnalisis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setEstado(prev => ({
      ...prev,
      cargando: false,
      estadoCarga: 'idle',
      progreso: 0,
      tiempoEstimado: null,
    }));
  };

  const obtenerDatosGrafico = async (
    idArchivo: string,
    tipoGrafico: string,
    parametros: { eje_x?: string; eje_y?: string; agregacion?: string }
  ) => {
    return await obtenerDatosGraficoAPI(idArchivo, tipoGrafico, parametros);
  };

  const agregarGrafico = (grafico: Grafico) => {
    const nuevosGraficos = [...graficos, grafico];
    setGraficos(nuevosGraficos);
    setEstado(prev => ({ ...prev, graficos: nuevosGraficos }));
  };

  const eliminarGrafico = (id: string) => {
    const nuevosGraficos = graficos.filter(g => g.id !== id);
    setGraficos(nuevosGraficos);
    setEstado(prev => ({ ...prev, graficos: nuevosGraficos }));
  };

  const reordenarGraficos = (fromIndex: number, toIndex: number) => {
    const nuevosGraficos = [...graficos];
    const [removed] = nuevosGraficos.splice(fromIndex, 1);
    nuevosGraficos.splice(toIndex, 0, removed);
    setGraficos(nuevosGraficos);
    setEstado(prev => ({ ...prev, graficos: nuevosGraficos }));
  };

  const limpiarEstado = () => {
    setEstado({
      cargando: false,
      estadoCarga: 'idle',
      progreso: 0,
      tiempoEstimado: null,
      error: null,
      resultado: null,
      sugerencias: [],
      graficos: [],
    });
    setGraficos([]);
  };

  // Actualizar estado con gráficos persistidos al montar
  useEffect(() => {
    setEstado(prev => ({ ...prev, graficos }));
  }, [graficos]);

  return {
    ...estado,
    estadoCargaTexto: ESTADOS_CARGA[estado.estadoCarga],
    analizarArchivo,
    cancelarAnalisis,
    obtenerDatosGrafico,
    agregarGrafico,
    eliminarGrafico,
    reordenarGraficos,
    limpiarEstado,
  };
};