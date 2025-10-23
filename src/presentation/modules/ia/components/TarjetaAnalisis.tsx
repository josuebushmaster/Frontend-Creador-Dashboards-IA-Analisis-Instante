import React from 'react';

interface PropsTarjetaAnalisis {
  titulo: string;
  analisis: string;
  alAgregarAlDashboard: () => void;
  animationDelay?: number; // milliseconds
}

const TarjetaAnalisis: React.FC<PropsTarjetaAnalisis> = ({
  titulo,
  analisis,
  alAgregarAlDashboard,
  animationDelay = 0,
}) => {
  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur transition hover:border-indigo-300/50 hover:shadow-indigo-500/20 animate-fadeIn"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:scale-110" aria-hidden />
      
      <div className="relative space-y-4">
        <header>
          <h3 className="text-lg font-semibold text-white">{titulo}</h3>
        </header>
        
        <div className="text-sm text-slate-200/80 leading-relaxed">
          <p>{analisis}</p>
        </div>
        
        <footer className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-200/60">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Sugerencia IA
          </div>
          
          <button
            onClick={alAgregarAlDashboard}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </footer>
      </div>
    </article>
  );
};

export default TarjetaAnalisis;