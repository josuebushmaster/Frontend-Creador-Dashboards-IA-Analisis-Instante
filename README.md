# Dashboard IA - Frontend

Una aplicación React moderna para análisis inteligente de datos con visualizaciones curadas por IA.

## 🚀 Características

- ✅ **Interfaz moderna y limpia** con gradientes y animaciones
- ✅ **Drag & Drop funcional** para subir archivos .xlsx/.csv
- ✅ **Estado de carga atractivo** con spinner y mensaje de IA
- ✅ **Tarjetas de análisis interactivas** con sugerencias de IA
- ✅ **Dashboard flexible** con drag-and-drop de gráficos
- ✅ **Múltiples tipos de gráficos** (barras, líneas, pastel, scatter)
- ✅ **Modo demo** para probar sin backend

## 🛠️ Instalación

```bash
npm install
```

## 🎮 Uso

### Modo Normal (con backend)
```bash
npm run dev
```

### Modo Demo (datos simulados)
```bash
# Opción 1: Usar archivo de configuración demo
cp .env.demo .env
npm run dev

# Opción 2: Activar variable manualmente
# Editar .env y cambiar VITE_DEMO_MODE=true
```

## 🔧 Configuración

### Variables de Entorno (.env)

```properties
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_DEMO_MODE=false
```

### Endpoints del Backend

- **Upload**: `POST /upload`
- **Chart Data**: `POST /chart-data`

## 🎯 Solución de Problemas

### Error 404: Backend no encontrado
1. Verifica que el backend esté ejecutándose en `http://localhost:8000`
2. Activa el modo demo: `VITE_DEMO_MODE=true`
3. La aplicación usará datos simulados automáticamente como fallback

### Error de Puerto en Uso
- El servidor automáticamente usará el siguiente puerto disponible
- Verifica la URL en la consola (ej: `http://localhost:5174`)

### Errores de TypeScript
```bash
npx tsc --noEmit  # Verificar errores
npm run build     # Compilar para producción
```

## 📦 Build para Producción

```bash
npm run build
npm run preview
```

## 🏗️ Arquitectura

```
src/
├── domain/entities/          # Entidades del dominio
├── infrastructure/api/       # Comunicación con backend
├── presentation/modules/ia/  # Componentes de UI
│   ├── components/          # Componentes reutilizables
│   ├── hooks/              # Hooks personalizados
│   └── pages/              # Páginas principales
└── assets/                 # Recursos estáticos
```

## 🎨 Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **React Grid Layout** para dashboard
- **React Dropzone** para carga de archivos
- **Axios** para HTTP requests

## 📝 Notas de Desarrollo

- El sistema incluye **fallback automático** a datos simulados
- **Hot Module Replacement** activo en desarrollo
- **Type safety** completo con TypeScript
- **Responsive design** para todos los dispositivos