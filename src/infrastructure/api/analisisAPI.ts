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

// Interfaces movidas a domain/entities/Analisis.ts

const mapearFrontendTipoAInterno = (frontendTipo: string) => {
  const mapeo: Record<string, string> = {
    'BarChart': 'barras',
    'LineChart': 'lineas', 
    'PieChart': 'pastel',
    'ScatterChart': 'scatter',
    'AreaChart': 'area',
    'RadarChart': 'radar'
  };
  const resultado = mapeo[frontendTipo] || null;
  console.debug('mapearFrontendTipoAInterno:', { frontendTipo, resultado: resultado || 'desconocido -> fallback a mapeo tradicional' });
  return resultado;
};

const mapearTipoGrafico = (tipoBackend: string) => {
  const low = (tipoBackend || '').toString().toLowerCase();
  const mapeo: Record<string, string> = {
    // barras / bar
    'bar': 'barras', 'bars': 'barras', 'barras': 'barras', 'histogram': 'barras', 'histograma': 'barras',
    // lineas / line
    'line': 'lineas', 'lines': 'lineas', 'lineas': 'lineas', 'serie': 'lineas',
    // pastel / pie
    'pie': 'pastel', 'pastel': 'pastel', 'donut': 'pastel',
    // area
    'area': 'area',
    // scatter / dispersion
    'scatter': 'scatter', 'dispersion': 'scatter', 'dispersiones': 'scatter', 'scatterplot': 'scatter',
    // radar
    'radar': 'radar'
  };
  const resultado = mapeo[low] || null;
  // log para depuración: qué recibió el backend y qué se mapeará internamente
  console.debug('mapearTipoGrafico:', { tipoBackend, low, resultado: resultado || 'desconocido -> por defecto barras' });
  return resultado || 'barras';
};

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
    },
    {
      id: '4',
      titulo: 'Crecimiento del Mercado por Trimestre',
      descripcion: 'Evolución suave del crecimiento trimestral mostrando una tendencia ascendente con aceleración en Q3.',
      tipo_grafico: 'area',
      parametros: { x_axis: 'trimestre', y_axis: 'crecimiento' },
      confidencia: 0.89
    },
    {
      id: '5',
      titulo: 'Correlación Edad vs Salario',
      descripcion: 'Dispersión que muestra la relación positiva entre edad y salario, con algunos valores atípicos interesantes.',
      tipo_grafico: 'scatter',
      parametros: { x_axis: 'edad', y_axis: 'salario' },
      confidencia: 0.85
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
    ],
    area: [
      { name: 'Q1', value: 8500 },
      { name: 'Q2', value: 12300 },
      { name: 'Q3', value: 18700 },
      { name: 'Q4', value: 22100 }
    ],
    scatter: [
      { name: '25 años', value: 35000, x: 25, y: 35000 },
      { name: '30 años', value: 45000, x: 30, y: 45000 },
      { name: '35 años', value: 55000, x: 35, y: 55000 },
      { name: '40 años', value: 62000, x: 40, y: 62000 },
      { name: '45 años', value: 70000, x: 45, y: 70000 },
      { name: '50 años', value: 75000, x: 50, y: 75000 }
    ]
  }
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
  // Si estamos en modo demo, usar datos simulados (sólo cuando la variable de entorno lo permita)
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
      // Usar frontend_tipo si está disponible, sino mapear tipo_grafico
      const tipoFinal = sug.frontend_tipo ? 
        mapearFrontendTipoAInterno(sug.frontend_tipo) : 
        mapearTipoGrafico(sug.tipo_grafico);
      
      return {
        id: `sugerencia-${index + 1}`,
        titulo: sug.titulo,
        descripcion: sug.insight,
        tipoGrafico: tipoFinal as any,
        configuracion: {
          ejeX: sug.parametros.eje_x,
          ejeY: sug.parametros.eje_y,
          tipoBackend: sug.tipo_grafico,
          frontendTipo: sug.frontend_tipo, // Preservar para chart-data
        },
        confidencia: 0.9, // El backend no envía confidencia aún, valor por defecto
      };
    });

    return { resultado, sugerencias };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    
    // Si hay error de conexión (incluyendo errores de red en navegador), no devolver datos simulados automáticamente.
    // En su lugar, lanzar un error claro para que el llamador decida la estrategia de fallback.
    if (axios.isAxiosError(error) && (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      !error.response ||
      error.response?.status === 404
    )) {
      console.error('Backend no disponible o error de red detectado al subir archivo. No se devolverán datos simulados automáticamente.');
      throw new Error('Backend no disponible o error de red al subir archivo');
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
): Promise<{ datos: any[]; fuente?: 'real' | 'simulado'; endpointUsado?: string | null }> => {
  // Si estamos en modo demo, usar datos simulados (sólo cuando la variable de entorno lo permita)
  if (MODO_DEMO) {
    console.log('🎭 Modo demo activado - usando datos simulados para el gráfico');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mapear tipo del gráfico al tipo clave de datos simulados
    const tipoMap: Record<string, keyof typeof datosSimulados.datosGraficos> = {
      'bar': 'bar',
      'barras': 'bar',
      'line': 'line', 
      'lineas': 'line',
      'pie': 'pie',
      'pastel': 'pie',
      'area': 'area',
      'scatter': 'scatter',
      'dispersion': 'scatter'
    };
    
    const tipoKey = tipoMap[tipoGrafico] || 'bar';
    const datos = datosSimulados.datosGraficos[tipoKey] || datosSimulados.datosGraficos.bar;
    
    return { datos, fuente: 'simulado', endpointUsado: null };
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
    // El backend expone /chart-data según la documentación; priorizamos esa ruta.
    const endpoints = [
      '/chart-data',
      '/api/graficos/chart-data',
      '/api/charts/chart-data',
      '/graficos/chart-data',
      '/charts/chart-data'
    ];

    // Cache simple en memoria del endpoint que funcionó (persistente durante la sesión)
    const cacheKey = '__chartEndpointCache';
    if (!(globalThis as any)[cacheKey]) {
      (globalThis as any)[cacheKey] = null;
    }
    let cached: string | null = (globalThis as any)[cacheKey] || null;

    let lastError: any = null;

    // Si hay cache, intentarla primero
    if (cached) {
      try {
        console.log(`� Intentando endpoint cacheado: ${cached}`);
        const response = await apiClient.post<RespuestaGraficoAPI>(cached, solicitud);
        const data = response.data;
        console.log(`📈 Datos del gráfico recibidos desde cache (${cached}):`, data);
        return { datos: data.datos, fuente: 'real', endpointUsado: cached } as any;
      } catch (err) {
        console.warn(`⚠️ Endpoint cacheado falló: ${cached} - limpiando cache y reintentando`);
        (globalThis as any)[cacheKey] = null;
        cached = null;
        lastError = err;
      }
    }

    for (const ep of endpoints) {
      try {
        console.log(`🔍 Intentando endpoint: ${ep}`);
        const response = await apiClient.post<RespuestaGraficoAPI>(ep, solicitud);
        const data = response.data;
        console.log(`📈 Datos del gráfico recibidos desde ${ep}:`, data);
        // Guardar endpoint exitoso en cache
        (globalThis as any)[cacheKey] = ep;
        
        // Usar frontendTipo si está disponible en la respuesta
        const tipoFrontend = data.configuracion?.frontendTipo ? 
          mapearFrontendTipoAInterno(data.configuracion.frontendTipo) : 
          null;
        
        return { 
          datos: data.datos, 
          fuente: 'real', 
          endpointUsado: ep,
          frontendTipo: data.configuracion?.frontendTipo,
          tipoInferido: tipoFrontend
        } as any;
      } catch (err) {
        lastError = err;
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) {
            console.warn(`❌ Endpoint no encontrado: ${ep} (404)`);
            continue;
          } else if (status === 405) {
            console.warn(`❌ Método no permitido: ${ep} (405 - posible configuración de backend)`);
            continue;
          } else {
            console.error(`❌ Error en ${ep}: ${status} - ${err.response?.data?.mensaje || err.message}`);
            throw err;
          }
        }
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
    
    // No usar fallback automático a datos simulados: propagar el error para que el llamador lo gestione
    console.error('Error al obtener datos del gráfico y no se devolverán datos simulados automáticamente:', error);
    throw error;
  }
};