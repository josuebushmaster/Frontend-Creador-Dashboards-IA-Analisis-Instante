import axios from 'axios';
import type { ResultadoAnalisis, SugerenciaAnalisis } from '../../domain/entities/Analisis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
const MODO_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Accept': 'application/json',
  },
});

// Datos simulados para modo demo
const datosSimulados = {
  sugerencias: [
    {
      id: '1',
      titulo: 'Distribución de Ventas por Región',
      descripcion: 'Este gráfico muestra cómo se distribuyen las ventas entre las diferentes regiones. La región Norte lidera con un 35% del total.',
      tipo_grafico: 'bar',
      parametros: { x_axis: 'region', y_axis: 'ventas' },
      confidencia: 0.95
    },
    {
      id: '2',
      titulo: 'Tendencia de Ingresos Mensuales',
      descripcion: 'Análisis temporal que revela un crecimiento sostenido del 15% en los últimos 6 meses, con una aceleración notable en Q4.',
      tipo_grafico: 'line',
      parametros: { x_axis: 'mes', y_axis: 'ingresos' },
      confidencia: 0.88
    },
    {
      id: '3',
      titulo: 'Participación por Categoría de Producto',
      descripcion: 'Los productos electrónicos representan el 42% de las ventas totales, seguidos por ropa (28%) y hogar (30%).',
      tipo_grafico: 'pie',
      parametros: { x_axis: 'categoria' },
      confidencia: 0.92
    }
  ],
  datosGraficos: {
    bar: [
      { name: 'Norte', value: 4500 },
      { name: 'Sur', value: 3200 },
      { name: 'Este', value: 2800 },
      { name: 'Oeste', value: 3900 }
    ],
    line: [
      { name: 'Ene', value: 15000 },
      { name: 'Feb', value: 16200 },
      { name: 'Mar', value: 14800 },
      { name: 'Abr', value: 17500 },
      { name: 'May', value: 18200 },
      { name: 'Jun', value: 19800 }
    ],
    pie: [
      { name: 'Electrónicos', value: 42 },
      { name: 'Ropa', value: 28 },
      { name: 'Hogar', value: 30 }
    ]
  }
};

export interface RespuestaSubida {
  exito: boolean;
  mensaje?: string;
  nombre_archivo: string;
  id_archivo: string;
  columnas: string[];
  total_filas: number;
  sugerencias: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    tipo_grafico: string;
    parametros: {
      x_axis?: string;
      y_axis?: string;
      x_column?: string;
      y_column?: string;
      columna_x?: string;
      columna_y?: string;
      column_x?: string;
      column_y?: string;
    };
    confidencia: number;
  }>;
}

export interface RespuestaGrafico {
  exito: boolean;
  mensaje?: string;
  datos: any[];
}

export interface Sugerencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo_grafico: string;
  parametros: {
    x_axis?: string;
    y_axis?: string;
    x_column?: string;
    y_column?: string;
    columna_x?: string;
    columna_y?: string;
    column_x?: string;
    column_y?: string;
  };
  confidencia: number;
}

const mapearTipoGrafico = (tipoBackend: string) => {
  const mapeo: Record<string, string> = {
    'bar': 'barras',
    'line': 'lineas',
    'pie': 'pastel',
    'area': 'area',
    'scatter': 'scatter',
    'radar': 'radar',
    'histogram': 'barras',
  };
  return mapeo[tipoBackend] || 'barras';
};

const detectarParametros = (sugerencia: Sugerencia) => {
  const { parametros } = sugerencia;
  
  // Detectar eje X con múltiples variantes
  const ejeX = parametros.x_axis || 
              parametros.x_column || 
              parametros.columna_x || 
              parametros.column_x;
              
  // Detectar eje Y con múltiples variantes
  const ejeY = parametros.y_axis || 
              parametros.y_column || 
              parametros.columna_y || 
              parametros.column_y;
              
  return { ejeX, ejeY };
};

export const subirArchivo = async (archivo: File): Promise<{
  resultado: ResultadoAnalisis;
  sugerencias: SugerenciaAnalisis[];
}> => {
  // Si estamos en modo demo o si el backend no está disponible, usar datos simulados
  if (MODO_DEMO) {
    console.log('🎭 Modo demo activado - usando datos simulados');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular tiempo de procesamiento
    
    const resultado: ResultadoAnalisis = {
      archivoId: 'demo-file-id',
      nombreArchivo: archivo.name,
      columnas: ['region', 'ventas', 'mes', 'ingresos', 'categoria'],
      totalFilas: 100,
    };

    const sugerencias: SugerenciaAnalisis[] = datosSimulados.sugerencias.map((sug) => {
      const { ejeX, ejeY } = detectarParametros(sug);
      
      return {
        id: sug.id,
        titulo: sug.titulo,
        descripcion: sug.descripcion,
        tipoGrafico: mapearTipoGrafico(sug.tipo_grafico) as any,
        configuracion: {
          ejeX: ejeX || '',
          ejeY: ejeY,
          tipoBackend: sug.tipo_grafico,
        },
        confidencia: sug.confidencia,
      };
    });

    return { resultado, sugerencias };
  }

  try {
    const formData = new FormData();
    formData.append('file', archivo);

    console.log('📤 Subiendo archivo:', archivo.name);
    console.log('📍 URL del endpoint:', `${API_URL}/upload`);

    const response = await apiClient.post<RespuestaSubida>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data;

    console.log('📥 Respuesta del servidor:', data);

    if (!data.exito) {
      throw new Error(data.mensaje || 'Error al subir el archivo');
    }

    const resultado: ResultadoAnalisis = {
      archivoId: data.id_archivo,
      nombreArchivo: data.nombre_archivo,
      columnas: data.columnas,
      totalFilas: data.total_filas,
    };

    const sugerencias: SugerenciaAnalisis[] = data.sugerencias.map((sug) => {
      const { ejeX, ejeY } = detectarParametros(sug);
      
      return {
        id: sug.id,
        titulo: sug.titulo,
        descripcion: sug.descripcion,
        tipoGrafico: mapearTipoGrafico(sug.tipo_grafico) as any,
        configuracion: {
          ejeX: ejeX || '',
          ejeY: ejeY,
          tipoBackend: sug.tipo_grafico,
        },
        confidencia: sug.confidencia,
      };
    });

    return { resultado, sugerencias };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    
    // Si hay error de conexión, usar datos simulados como fallback
    if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.response?.status === 404)) {
      console.log('🔄 Backend no disponible, usando datos simulados como fallback');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultado: ResultadoAnalisis = {
        archivoId: 'fallback-file-id',
        nombreArchivo: archivo.name,
        columnas: ['region', 'ventas', 'mes', 'ingresos', 'categoria'],
        totalFilas: 100,
      };

      const sugerencias: SugerenciaAnalisis[] = datosSimulados.sugerencias.map((sug) => {
        const { ejeX, ejeY } = detectarParametros(sug);
        
        return {
          id: sug.id,
          titulo: sug.titulo,
          descripcion: sug.descripcion,
          tipoGrafico: mapearTipoGrafico(sug.tipo_grafico) as any,
          configuracion: {
            ejeX: ejeX || '',
            ejeY: ejeY,
            tipoBackend: sug.tipo_grafico,
          },
          confidencia: sug.confidencia,
        };
      });

      return { resultado, sugerencias };
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.mensaje || error.response?.data?.message;
      
      if (status === 404) {
        throw new Error('Servidor no encontrado. Asegúrate de que el backend esté ejecutándose en http://localhost:8000');
      } else if (status === 500) {
        throw new Error('Error interno del servidor: ' + (message || 'Error desconocido'));
      }
      
      throw new Error(
        message || 
        error.message || 
        'Error de conexión con el servidor'
      );
    }
    throw error;
  }
};

export const obtenerDatosGrafico = async (
  idArchivo: string,
  tipoGrafico: string,
  parametros: { x_axis?: string; y_axis?: string }
): Promise<{ datos: any[] }> => {
  // Si estamos en modo demo o usando datos simulados
  if (MODO_DEMO || idArchivo.includes('demo') || idArchivo.includes('fallback')) {
    console.log('🎭 Usando datos simulados para el gráfico');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tipoKey = tipoGrafico as keyof typeof datosSimulados.datosGraficos;
    const datos = datosSimulados.datosGraficos[tipoKey] || datosSimulados.datosGraficos.bar;
    
    return { datos };
  }

  try {
    console.log('📊 Obteniendo datos del gráfico:', { idArchivo, tipoGrafico, parametros });

    const payload = {
      id_archivo: idArchivo,
      tipo_grafico: tipoGrafico,
      parametros: {
        x_axis: parametros.x_axis,
        ...(parametros.y_axis && { y_axis: parametros.y_axis }),
      },
    };

    const response = await apiClient.post<RespuestaGrafico>('/chart-data', payload);
    const data = response.data;

    console.log('📈 Datos del gráfico recibidos:', data);

    if (!data.exito) {
      throw new Error(data.mensaje || 'Error al obtener datos del gráfico');
    }

    return { datos: data.datos };
  } catch (error) {
    console.error('Error al obtener datos del gráfico:', error);
    
    // Fallback a datos simulados si hay error
    if (axios.isAxiosError(error)) {
      console.log('🔄 Usando datos simulados como fallback para gráfico');
      
      const tipoKey = tipoGrafico as keyof typeof datosSimulados.datosGraficos;
      const datos = datosSimulados.datosGraficos[tipoKey] || datosSimulados.datosGraficos.bar;
      
      return { datos };
    }
    throw error;
  }
};