import { useState } from 'react';
import type { ResultadoAnalisis, SugerenciaAnalisis } from '../../../../domain/entities/Analisis';
import { subirArchivo, obtenerDatosGrafico as obtenerDatosGraficoAPI } from '../../../../infrastructure/api/analisisAPI';

export interface Estado {
  cargando: boolean;
  error: string | null;
  resultado: ResultadoAnalisis | null;
  sugerencias: SugerenciaAnalisis[];
}

export const useAnalisis = () => {
  const [estado, setEstado] = useState<Estado>({
    cargando: false,
    error: null,
    resultado: null,
    sugerencias: [],
  });

  const analizarArchivo = async (archivo: File) => {
    setEstado(prev => ({
      ...prev,
      cargando: true,
      error: null,
    }));

    try {
      const { resultado, sugerencias } = await subirArchivo(archivo);
      
      setEstado({
        cargando: false,
        error: null,
        resultado,
        sugerencias,
      });
    } catch (error) {
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  const obtenerDatosGrafico = async (
    idArchivo: string,
    tipoGrafico: string,
    parametros: { x_axis?: string; y_axis?: string }
  ) => {
    return await obtenerDatosGraficoAPI(idArchivo, tipoGrafico, parametros);
  };

  const limpiarEstado = () => {
    setEstado({
      cargando: false,
      error: null,
      resultado: null,
      sugerencias: [],
    });
  };

  return {
    ...estado,
    analizarArchivo,
    obtenerDatosGrafico,
    limpiarEstado,
  };
};