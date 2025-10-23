import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
} from 'recharts';
import type { Grafico } from '../../../../domain/entities/Analisis';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

interface PropsGraficoRecharts {
  grafico: Grafico;
}

const normalizarDatos = (datos: any[]) => {
  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    console.warn('⚠️ Datos vacíos o inválidos para normalizar:', datos);
    return [];
  }

  // Filtrar elementos nulos o inválidos
  const datosValidos = datos.filter(item => item && typeof item === 'object');
  
  if (datosValidos.length === 0) {
    console.warn('⚠️ No hay elementos válidos después del filtrado');
    return [];
  }

  // Detectar formato de datos
  const primerItem = datosValidos[0];
  
  try {
    // Formato {name, value} - típico para gráficos de barras/líneas
    if ('name' in primerItem && 'value' in primerItem) {
      return datosValidos.filter(item => 
        item.name != null && 
        item.value != null && 
        !isNaN(Number(item.value))
      );
    }
    
    // Formato {x, y} - típico para scatter
    if ('x' in primerItem && 'y' in primerItem) {
      return datosValidos
        .filter(item => item.x != null && item.y != null && !isNaN(Number(item.y)))
        .map(item => {
          const rawX = item.x;
          const rawY = item.y;
          const numX = Number(rawX);
          const numY = Number(rawY);
          return {
            // name se muestra en ejes categóricos o tooltips
            name: rawX != null ? String(rawX) : '',
            value: !isNaN(numY) ? numY : 0,
            x: !isNaN(numX) ? numX : rawX,
            y: !isNaN(numY) ? numY : rawY,
          };
        });
    }
    
    // Formato {label, valor} 
    if ('label' in primerItem && 'valor' in primerItem) {
      return datosValidos
        .filter(item => item.label != null && item.valor != null && !isNaN(Number(item.valor)))
        .map(item => ({ name: item.label, value: item.valor }));
    }

    // Intento genérico: tomar las primeras dos propiedades
    const keys = Object.keys(primerItem);
    if (keys.length >= 2) {
      return datosValidos
        .filter(item => item[keys[0]] != null && item[keys[1]] != null)
        .map(item => {
          const rawX = item[keys[0]];
          const rawY = item[keys[1]];
          const numY = Number(rawY);
          return ({
            name: rawX != null ? String(rawX) : '',
            value: isNaN(numY) ? 0 : numY,
            x: !isNaN(Number(rawX)) ? Number(rawX) : rawX,
            y: !isNaN(numY) ? numY : rawY,
          });
        });
    }
    
    return datosValidos;
  } catch (error) {
    console.error('❌ Error al normalizar datos:', error);
    return [];
  }
};

// Función para generar descripción textual de datos para accesibilidad
const generarDescripcionGrafico = (grafico: Grafico, datos: any[]): string => {
  if (!datos || datos.length === 0) return 'Gráfico sin datos disponibles';
  
  const valores = datos.map(d => Number(d.value ?? d.y ?? d.valor ?? 0)).filter(v => !isNaN(v));
  const minValue = Math.min(...valores);
  const maxValue = Math.max(...valores);
  const avgValue = valores.reduce((a, b) => a + b, 0) / valores.length;
  
  const formatter = new Intl.NumberFormat('es-ES');
  
  return `Gráfico de tipo ${grafico.tipo} titulado "${grafico.titulo}". 
    Contiene ${datos.length} elementos de datos. 
    El valor mínimo es ${formatter.format(minValue)}, 
    el máximo es ${formatter.format(maxValue)}, 
    y el promedio es ${formatter.format(Math.round(avgValue))}.`;
};

const GraficoRecharts: React.FC<PropsGraficoRecharts> = ({ grafico }) => {
  // Normalizar datos y memoizar el resultado para evitar recomputos innecesarios
  const datosRaw = grafico.configuracion.datos || [];
  const {
    datosNormalizados: datosNormalizadosFinal,
    scatterXAxisKey,
    xLabelMap
  } = React.useMemo(() => {
    const base = normalizarDatos(datosRaw || []);
    if (!base || base.length === 0) return { datosNormalizados: base, scatterXAxisKey: 'x', xLabelMap: null };

    // Detectar si tenemos coordenadas x
    const hasX = base.every(item => Object.prototype.hasOwnProperty.call(item, 'x'));
    if (!hasX) return { datosNormalizados: base, scatterXAxisKey: 'x', xLabelMap: null };

    // ¿Son todas las X numéricas?
    const isXNumeric = base.every(item => typeof item.x === 'number' && !isNaN(item.x));
    if (isXNumeric) return { datosNormalizados: base, scatterXAxisKey: 'x', xLabelMap: null };

    // Si X es categórico -> mapear a índices numéricos (xNum) y mantener etiquetas originales
    const map = new Map<string, number>();
    let idx = 0;
    const mapped = base.map(item => {
      const key = item.x != null ? String(item.x) : '';
      if (!map.has(key)) {
        map.set(key, idx++);
      }
      return { ...item, xNum: map.get(key) };
    });

    const labels = Array.from(map.keys());
    return { datosNormalizados: mapped, scatterXAxisKey: 'xNum', xLabelMap: labels };
  }, [JSON.stringify(datosRaw)]);

  // Normalizar tipo: priorizar frontendTipo, luego mapear tipos tradicionales
  const normalizarTipo = (t?: string | null) => {
    if (!t) return null;
    const low = t.toString().toLowerCase();
    const mapping: Record<string, string> = {
      // Frontend tipos (Recharts components)
      'barchart': 'barras', 'linechart': 'lineas', 'piechart': 'pastel', 
      'scatterchart': 'scatter', 'areachart': 'area', 'radarchart': 'radar',
      // Tipos tradicionales
      'bar': 'barras', 'bars': 'barras', 'barras': 'barras', 'histogram': 'barras',
      'line': 'lineas', 'lines': 'lineas', 'lineas': 'lineas',
      'pie': 'pastel', 'pastel': 'pastel', 'donut': 'pastel',
      'scatter': 'scatter', 'dispersion': 'scatter', 'dispersiones': 'scatter',
      'area': 'area',
      'radar': 'radar'
    };
    return mapping[low] || null;
  };

  const tipoCanon = normalizarTipo(grafico.configuracion.frontendTipo) || 
                   normalizarTipo(grafico.tipo) || 
                   normalizarTipo(grafico.configuracion.tipoBackend) || 
                   null;

  // Depuración: mostrar tipo y muestra de datos
  try {
    // eslint-disable-next-line no-console
    console.debug('Renderizando gráfico - tipo original:', grafico.tipo, 'tipoBackend:', grafico.configuracion.tipoBackend, 'tipoCanon:', tipoCanon, 'datos sample:', datosNormalizadosFinal.slice(0, 5));
  } catch (e) {
    // ignore
  }

  const inferirTipoPorDatos = (datos: any[]): string | null => {
    if (!datos || datos.length === 0) return null;
    const sample = datos[0];
    // Si tiene x e y (o xNum) -> scatter
    if ((('x' in sample) || ('xNum' in sample)) && ('y' in sample)) return 'scatter';
    // Si pocos elementos (<11) y sum(values) aprox 100 -> pastel
    const values = datos.map(d => Number(d.value ?? d.valor ?? 0)).filter(v => !isNaN(v));
    if (values.length > 0 && datos.length <= 10) {
      const s = values.reduce((a, b) => a + b, 0);
      if (s > 80 && s < 120) return 'pastel';
    }
    // Si muchos elementos -> barras
    if (datos.length > 10) return 'barras';
    // Por defecto, líneas
    return 'lineas';
  };

  const renderizarGrafico = () => {
    // Use canonical type if available, otherwise infer from datos
  const tipoFinal = tipoCanon || inferirTipoPorDatos(datosNormalizadosFinal) || 'barras';
    switch (tipoFinal) {
      case 'barras':
        return (
          <BarChart data={datosNormalizadosFinal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc'
              }} 
            />
            <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'lineas':
        return (
          <LineChart data={datosNormalizadosFinal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={COLORS[1]} 
              strokeWidth={3}
              dot={{ fill: COLORS[1], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'pastel':
        return (
          <PieChart>
            <Pie
              data={datosNormalizadosFinal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {datosNormalizadosFinal.map((_, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc'
              }} 
            />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={datosNormalizadosFinal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} />
            <Area type="monotone" dataKey="value" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.2} />
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={datosNormalizadosFinal}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" stroke="#94a3b8" />
            <PolarRadiusAxis />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }} />
            <Radar name={grafico.titulo} dataKey="value" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.35} />
          </RadarChart>
        );
      case 'scatter':
        {
          const ejeXLabel = grafico.configuracion?.ejeX || 'X';
          const ejeYLabel = grafico.configuracion?.ejeY || 'Y';
          const numberFormatter = new Intl.NumberFormat('es-ES');

            const CustomScatterTooltip = ({ active, payload }: any) => {
            if (!active || !payload || !payload.length) return null;
            const p = payload[0].payload || payload[0];
            const rawX = p.x ?? p.xNum ?? p.name ?? '';
            const rawY = p.y ?? p.value ?? '';
            const displayX = (p.xNum != null && xLabelMap && xLabelMap[p.xNum]) ? xLabelMap[p.xNum] : rawX;
            const displayY = typeof rawY === 'number' ? numberFormatter.format(rawY) : rawY;

            return (
              <div className="bg-slate-900 p-2 rounded-md border border-slate-700 text-slate-100">
                <div className="text-xs opacity-90">{grafico.titulo}</div>
                <div className="text-sm mt-1"><strong>{ejeXLabel}:</strong> {displayX}</div>
                <div className="text-sm"><strong>{ejeYLabel}:</strong> {displayY}</div>
              </div>
            );
          };

          return (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey={scatterXAxisKey}
                stroke="#94a3b8"
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(v: any) => {
                  if (scatterXAxisKey === 'xNum' && xLabelMap) return xLabelMap[v] ?? v;
                  return v;
                }}
                label={{ value: grafico.configuracion?.ejeX || '', position: 'insideBottom', offset: -8 }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
                label={{ value: grafico.configuracion?.ejeY || '', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomScatterTooltip />} />
              <Scatter name={grafico.titulo} data={datosNormalizadosFinal} dataKey="y" fill={COLORS[2]} />
            </ScatterChart>
          );
        }

      default:
        return (
          <div className="flex h-full items-center justify-center text-slate-400">
            <p>Tipo de gráfico no soportado: {grafico.tipo}</p>
          </div>
        );
    }
  };

  if (!datosNormalizadosFinal.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400 p-6">
        <svg className="h-12 w-12 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium text-slate-400 mb-1">No hay datos disponibles</p>
        <p className="text-xs text-slate-500 text-center">
          Los datos del gráfico están vacíos o tienen un formato incompatible
        </p>
      </div>
    );
  }

  const descripcionGrafico = generarDescripcionGrafico(grafico, datosNormalizadosFinal);
  const chartId = `chart-${grafico.id}`;

  return (
    <div 
      className="h-full w-full relative"
      role="img"
      aria-labelledby={`${chartId}-title`}
      aria-describedby={`${chartId}-desc`}
    >
      {/* Título accesible (oculto visualmente) */}
      <h3 id={`${chartId}-title`} className="sr-only">
        {grafico.titulo}
      </h3>
      
      {/* Descripción accesible (oculta visualmente) */}
      <div id={`${chartId}-desc`} className="sr-only">
        {descripcionGrafico}
      </div>

      {grafico.configuracion.fuente === 'simulado' && (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-yellow-100/90 px-3 py-1 text-xs font-semibold text-yellow-900 shadow">
          <svg className="h-3 w-3 text-yellow-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a8 8 0 110 16 8 8 0 010-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
          Simulado
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {renderizarGrafico()}
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoRecharts;