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
        .map(item => ({ name: item.x, value: item.y, x: item.x, y: item.y }));
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
        .map(item => ({
          name: item[keys[0]],
          value: isNaN(Number(item[keys[1]])) ? 0 : Number(item[keys[1]])
        }));
    }
    
    return datosValidos;
  } catch (error) {
    console.error('❌ Error al normalizar datos:', error);
    return [];
  }
};

const GraficoRecharts: React.FC<PropsGraficoRecharts> = ({ grafico }) => {
  const datosNormalizados = normalizarDatos(grafico.configuracion.datos || []);

  const renderizarGrafico = () => {
    switch (grafico.tipo) {
      case 'barras':
        return (
          <BarChart data={datosNormalizados}>
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
          <LineChart data={datosNormalizados}>
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
              data={datosNormalizados}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {datosNormalizados.map((_, index) => (
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

      case 'scatter':
        return (
          <ScatterChart data={datosNormalizados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="x" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              dataKey="y"
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
            <Scatter dataKey="y" fill={COLORS[2]} />
          </ScatterChart>
        );

      default:
        return (
          <div className="flex h-full items-center justify-center text-slate-400">
            <p>Tipo de gráfico no soportado: {grafico.tipo}</p>
          </div>
        );
    }
  };

  if (!datosNormalizados.length) {
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

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderizarGrafico()}
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoRecharts;