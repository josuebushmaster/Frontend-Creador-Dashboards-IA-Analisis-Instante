export type TipoGrafico = 'barras' | 'lineas' | 'pastel' | 'area' | 'scatter' | 'radar';

export interface ConfiguracionGrafico {
  ejeX: string;
  ejeY?: string;
  datos?: any[];
  tipoBackend?: string;
  // Metadata opcional sobre la fuente de datos
  fuente?: 'real' | 'simulado';
  endpointUsado?: string | null;
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

// ============================================================================
// INTERFACES PARA API DEL BACKEND (formato en español)
// ============================================================================

export interface ParametrosGrafico {
  eje_x: string;
  eje_y?: string;
  agregacion?: 'suma' | 'promedio' | 'conteo' | 'minimo' | 'maximo';
}

export interface SugerenciaGraficoAPI {
  titulo: string;
  tipo_grafico: 'barras' | 'lineas' | 'pastel' | 'dispersion' | 'area';
  parametros: ParametrosGrafico;
  insight: string;
}

export interface MetadatosArchivo {
  filas: number;
  columnas: number;
  nombres_columnas: string[];
  tipos_columnas: Record<string, string>;
  conteo_nulos: Record<string, number>;
  uso_memoria_mb: number;
}

export interface AnalisisIA {
  resumen: string;
  insights: string[];
  sugerencias_graficos: SugerenciaGraficoAPI[];
}

export interface RespuestaAnalisisAPI {
  id_archivo: string;
  nombre_archivo: string;
  estado: string;
  metadatos: MetadatosArchivo;
  vista_previa: any[];
  estadisticas_resumen: any;
  analisis: AnalisisIA;
}

export interface SolicitudGraficoAPI {
  id_archivo: string;
  tipo_grafico: string;
  eje_x: string;
  eje_y?: string;
  titulo?: string;
  agregacion?: string;
}

export interface RespuestaGraficoAPI {
  id_grafico: string;
  tipo_grafico: string;
  titulo: string;
  datos: any[];
  configuracion: any;
  metadatos: any;
}