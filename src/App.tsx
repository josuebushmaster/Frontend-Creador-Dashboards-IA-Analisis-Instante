import PaginaIA from './presentation/modules/ia/pages/PaginaIA'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Dashboard IA
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Análisis inteligente de datos con visualizaciones curadas por IA
          </p>
        </header>
        <main>
          <PaginaIA />
        </main>
      </div>
    </div>
  )
}

export default App