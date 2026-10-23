import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => {
        let borderColor = 'border-white/10';
        let icon = <Info className="w-4 h-4 text-[#00FF66] shrink-0" />;

        if (toast.type === 'success') {
          borderColor = 'border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.2)]';
          icon = <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />;
        } else if (toast.type === 'alert') {
          borderColor = 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
          icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#121217] border ${borderColor} text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {icon}
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
