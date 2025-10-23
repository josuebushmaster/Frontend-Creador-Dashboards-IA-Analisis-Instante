# Dashboard IA - Frontend

Este repositorio contiene el frontend de un dashboard interactivo para análisis asistido por IA. Está construido con React + TypeScript y Vite, utiliza Recharts para visualizaciones y Tailwind CSS para estilos. El proyecto incluye funcionalidades de carga de datos, generación de gráficos dinámicos, persistencia local, exportación (PNG/PDF), accesibilidad mejorada y estados de carga detallados.

## Contenido rápido

- Framework: React 18 + TypeScript
- Bundler: Vite
- Estilos: Tailwind CSS
- Visualizaciones: Recharts
- Testing: (no incluido por defecto — ver sección 'Tests' para añadir)

## Estructura del proyecto (árbol resumido)

```text
Frontend/
├─ index.html                    # Entrada HTML para Vite
├─ package.json                  # Dependencias y scripts
├─ vite.config.ts                # Configuración de Vite
├─ tsconfig.json
├─ postcss.config.js
├─ tailwind.config.cjs
├─ public/                       # Archivos estáticos
└─ src/
  ├─ main.tsx                    # Punto de entrada de React
  ├─ index.css
  ├─ App.tsx
  ├─ assets/                     # Imágenes, íconos, etc.
  ├─ domain/
  │  └─ entities/
  │     └─ Analisis.ts           # Entidades del dominio (tipos/DTOs)
  ├─ infrastructure/
  │  └─ api/
  │     └─ analisisAPI.ts        # Lógica de llamadas HTTP al backend
  └─ presentation/
     └─ modules/
        └─ ia/
           ├─ components/
           │  ├─ CargaArchivo.tsx    # Componente para subir/cargar archivos
           │  ├─ GraficoRecharts.tsx  # Componente que renderiza los gráficos con Recharts
           │  ├─ LoadingProgress.tsx  # Indicador de progreso granular
           │  ├─ ExportControls.tsx   # Botones para exportar/compartir el dashboard
           │  └─ TarjetaAnalisis.tsx  # UI para cada análisis / tarjeta
           ├─ hooks/
           │  ├─ index.ts
           │  └─ useAnalisis.ts       # Hook principal para manejo de estado, persistencia y lógica de negocio
           └─ pages/
              └─ PaginaIA.tsx        # Página principal del dashboard IA
```

## Propósito de carpetas y archivos

- `index.html`: plantilla HTML que Vite sirve en desarrollo y que se usa como base para la SPA.
- `package.json`: scripts (dev, build, preview, test) y dependencias.
- `vite.config.ts`: configuración del bundler (alias, plugins, optimizaciones).
- `src/main.tsx`: montaje de React y providers globales si existen.
- `src/App.tsx`: enrutado principal / layout global.
- `src/domain/entities/Analisis.ts`: tipos y modelos del dominio (por ejemplo, la forma de un análisis o gráfico).
- `src/infrastructure/api/analisisAPI.ts`: abstracción para llamadas a la API (fetch/axios). Contiene funciones que realizan requests al backend y retornan datos tipados.
- `src/presentation/modules/ia/hooks/useAnalisis.ts`: hook reutilizable que contiene la lógica principal del dashboard:
  - Gestión de lista de gráficos (agregar, eliminar, reordenar)
  - Persistencia en localStorage
  - Estados de carga granular (uploading, processing, analyzing, generating)
  - Cancelación de peticiones con AbortController
  - Generación de toasts/errores y simulación de progreso cuando procede
- `src/presentation/modules/ia/components/GraficoRecharts.tsx`: componente encargado de renderizar distintos tipos de gráficos (bar, line, scatter...) usando Recharts. Incluye mejoras de accesibilidad (role="img", descripciones generadas) y normalización de datos.
- `src/presentation/modules/ia/components/CargaArchivo.tsx`: dropzone / input de archivos para subir datasets.
- `src/presentation/modules/ia/components/LoadingProgress.tsx`: indicador de progreso granular con posibilidad de cancelar.
- `src/presentation/modules/ia/components/ExportControls.tsx`: exportación de dashboard a PNG/PDF (usa html2canvas y jsPDF) y web share cuando está disponible.
- `src/presentation/modules/ia/pages/PaginaIA.tsx`: orquesta los componentes y usa `useAnalisis` para proporcionar la experiencia completa del dashboard.

## Arquitectura y decisiones de diseño

Arquitectura aplicada: una arquitectura por capas simple y convencional que separa dominio, infraestructura y presentación. Esto facilita pruebas unitarias, reutilización de lógica y despliegue independiente del backend.

- Capa de dominio (`domain/`): tipos y casos de uso puros que definen la información manejada por la aplicación.
- Capa de infraestructura (`infrastructure/`): adaptadores a APIs externas (HTTP). Abstrae detalles de comunicación.
- Capa de presentación (`presentation/`): componentes React, hooks y páginas; responsable de la UI y la orquestación entre el dominio y la infraestructura.

Motivaciones principales:

- Separación clara de responsabilidades para facilitar mantenimiento y pruebas.
- Hooks como unidad de lógica (p. ej. `useAnalisis`) para reutilizar lógica de estado y facilitar testing.
- Persistencia local para mejorar la experiencia (ediciones no perdidas, restauración del dashboard).

### Decisiones técnicas y librerías usadas

- React + TypeScript (Vite): elección por rendimiento en desarrollo (HMR rápido), tipado fuerte y ecosistema maduro.
- Tailwind CSS: para estilos utilitarios rápidos y consistentes.
- Recharts: librería de charts declarativa, sencilla de integrar con React y suficientemente flexible para la mayoría de visualizaciones del dashboard.
- html2canvas + jsPDF: para exportar el dashboard a PNG/PDF del lado del cliente sin depender del backend.
- AbortController: para permitir cancelación de solicitudes largas (mejora UX cuando el usuario cancela operaciones).
- localStorage: persistencia simple y suficiente para el alcance del prototipo. Si se requiere sincronización multi-dispositivo, migrar a backend o a IndexedDB.
- React Grid Layout / Drag Handle (o react-dnd en variantes): para reordenamiento y disposición responsiva de widgets.

Decisiones de implementación importantes:

- No usar datos simulados como fallback automático: si el backend falla se muestra un error controlado y se solicita al usuario reintentar. (Se puede habilitar demo-mode explícito si es necesario.)
- Estados de carga desglosados para mostrar progreso realista al usuario y permitir cancelación.
- Accesibilidad: etiquetas ARIA, roles y descripciones a los gráficos para lectores de pantalla.

## Cómo ejecutar

En Windows (PowerShell) desde la carpeta `Frontend`:

```powershell
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:5173/`.

## Verificaciones rápidas implementadas

- Eliminar gráfico: botón en la esquina de cada tarjeta que remueve el gráfico y actualiza la persistencia.
- Exportar: controles para exportar dashboard a PNG/PDF y compartir.
- Cancelación: durante pasos largos (por ejemplo: procesamiento) el usuario puede cancelar la operación.

## Siguientes pasos recomendados

1. Añadir tests automáticos (Jest + React Testing Library o Vitest) para `useAnalisis` y `GraficoRecharts`.
2. Añadir integración con backend real y manejo de autenticación si se requiere multi-usuario.
3. Reemplazar `localStorage` por `IndexedDB` (p. ej. usando Dexie) para datasets grandes y mayor robustez.
4. Añadir un modo demo explícito con datos simulados controlado por configuración / env var.

## Notas de despliegue

- Para build de producción:

```powershell
npm run build
npm run preview
```

- Servir los archivos estáticos desde un CDN o un servidor estático (Netlify, Vercel, GitHub Pages, etc.).

---
Creado por [Josue Pastil, desarollador fullstack]