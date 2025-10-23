import React from 'react';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const bgFor = (type?: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-600';
    case 'error':
      return 'bg-rose-600';
    default:
      return 'bg-slate-700';
  }
};

const ToastContainer: React.FC<Props> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className={`w-80 max-w-full p-3 rounded-lg text-white shadow-lg ${bgFor(t.type)} cursor-pointer animate-fadeIn`} 
          onClick={() => onRemove(t.id)}
        >
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
