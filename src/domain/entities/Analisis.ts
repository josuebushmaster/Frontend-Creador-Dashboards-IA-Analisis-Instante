export type TipoGrafico = 'barras' | 'lineas' | 'pastel' | 'area' | 'scatter' | 'radar';

export interface ConfiguracionGrafico {
  ejeX: string;
  ejeY?: string;
  datos?: any[];
  tipoBackend?: string;
}

export interface Grafico {
  id: string;
  titulo: string;
  tipo: TipoGrafico;
  configuracion: ConfiguracionGrafico;
}

export interface SugerenciaAnalisis {
  id: string;
  titulo: string;
  descripcion: string;
  tipoGrafico: TipoGrafico;
  configuracion: ConfiguracionGrafico;
  confidencia: number;
}

export interface ResultadoAnalisis {
  archivoId: string;
  nombreArchivo: string;
  columnas: string[];
  totalFilas: number;
  resumen?: {
    [columna: string]: {
      tipo: 'numerico' | 'categorico' | 'fecha';
      valores_unicos?: number;
      nulos?: number;
      estadisticas?: {
        media?: number;
        mediana?: number;
        min?: number;
        max?: number;
        std?: number;
      };
    };
  };
}