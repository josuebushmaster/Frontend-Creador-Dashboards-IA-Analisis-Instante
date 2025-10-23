import axios from 'axios';
import type { 
  ResultadoAnalisis, 
  SugerenciaAnalisis,
  RespuestaAnalisisAPI,
  RespuestaGraficoAPI,
  SolicitudGraficoAPI
} from '../../domain/entities/Analisis';

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

// Interfaces movidas a domain/entities/Analisis.ts

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

// Función auxiliar para extraer parámetros de sugerencias de datos simulados
const detectarParametros = (sugerencia: typeof datosSimulados.sugerencias[0]) => {
  const { parametros } = sugerencia;
  
  // Los datos simulados usan x_axis/y_axis
  const ejeX = parametros.x_axis || '';
  const ejeY = parametros.y_axis;
              
  return { ejeX, ejeY };
};

export const subirArchivo = async (archivo: File): Promise<{
  resultado: ResultadoAnalisis;
  sugerencias: SugerenciaAnalisis[];
}> => {
  // Si estamos en modo demo, usar datos simulados
  if (MODO_DEMO) {
    console.log('🎭 Modo demo activado - usando datos simulados');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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

    // No establecer manualmente 'Content-Type' — dejar que el navegador añada el boundary
    const response = await apiClient.post<RespuestaAnalisisAPI>('/upload', formData);
    const data = response.data;

    console.log('📥 Respuesta del servidor:', data);

    // Verificar estado de la respuesta - aceptar valores en español e inglés
    const estadoRaw = (data.estado || '').toString();
    const estado = estadoRaw.toLowerCase();
    const estadosOk = [
      'analyzed',
      'analizado',
      'processed',
      'procesado',
      'done',
      'completado',
      'completo',
      'success',
      'ok',
    ];

    if (!estadosOk.includes(estado)) {
      console.warn('Estado inesperado del análisis:', data.estado);
      throw new Error('Error al analizar el archivo');
    }
    
    // Convertir respuesta de la API a nuestro formato interno
    const resultado: ResultadoAnalisis = {
      archivoId: data.id_archivo,
      nombreArchivo: data.nombre_archivo,
      columnas: data.metadatos.nombres_columnas,
      totalFilas: data.metadatos.filas,
    };

    // Convertir sugerencias de gráficos
    const sugerencias: SugerenciaAnalisis[] = data.analisis.sugerencias_graficos.map((sug, index) => {
      return {
        id: `sugerencia-${index + 1}`,
        titulo: sug.titulo,
        descripcion: sug.insight,
        tipoGrafico: mapearTipoGrafico(sug.tipo_grafico) as any,
        configuracion: {
          ejeX: sug.parametros.eje_x,
          ejeY: sug.parametros.eje_y,
          tipoBackend: sug.tipo_grafico,
        },
        confidencia: 0.9, // El backend no envía confidencia aún, valor por defecto
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
      const message = error.response?.data?.mensaje || error.response?.data?.detalle;
      
      if (status === 404) {
        throw new Error('Servidor no encontrado. Asegúrate de que el backend esté ejecutándose en http://localhost:8000');
      } else if (status === 500) {
        console.error('Respuesta del servidor (500):', error.response?.data);
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
  parametros: { eje_x?: string; eje_y?: string; agregacion?: string }
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

    // Construir solicitud con nuevos nombres en español
    const solicitud: SolicitudGraficoAPI = {
      id_archivo: idArchivo,
      tipo_grafico: tipoGrafico,
      eje_x: parametros.eje_x || '',
      ...(parametros.eje_y && { eje_y: parametros.eje_y }),
      ...(parametros.agregacion && { agregacion: parametros.agregacion }),
    };

    // Intentar múltiples endpoints en orden de preferencia
    const endpoints = [
      '/chart-data', 
      '/api/charts/chart-data',
      '/graficos/chart-data',
      '/charts/chart-data'
    ];
    let lastError: any = null;

    for (const ep of endpoints) {
      try {
        console.log(`🔍 Intentando endpoint: ${ep}`);
        const response = await apiClient.post<RespuestaGraficoAPI>(ep, solicitud);
        const data = response.data;
        console.log(`📈 Datos del gráfico recibidos desde ${ep}:`, data);
        return { datos: data.datos };
      } catch (err) {
        lastError = err;
        
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          
          // Para 404 (Not Found) o 405 (Method Not Allowed), intentar siguiente endpoint
          if (status === 404) {
            console.warn(`❌ Endpoint no encontrado: ${ep} (404)`);
            continue;
          } else if (status === 405) {
            console.warn(`❌ Método no permitido: ${ep} (405 - posible configuración de backend)`);
            continue;
          } else {
            // Para otros errores (500, 401, etc.), no intentar más endpoints
            console.error(`❌ Error en ${ep}: ${status} - ${err.response?.data?.mensaje || err.message}`);
            throw err;
          }
        }
        
        // Error no relacionado con HTTP
        console.error(`❌ Error de conexión en ${ep}:`, err);
        throw err;
      }
    }

    // Si llegamos aquí, todos los endpoints devolvieron 404/405
    console.error(`❌ Todos los endpoints para chart-data fallaron. Últimos intentados: ${endpoints.join(', ')}`);
    console.warn('ℹ️  Posible problema: El backend no tiene configurado el endpoint para obtener datos de gráficos');
    throw lastError;
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