import { FiX, FiAlertTriangle } from "react-icons/fi";
import { ReactNode, useEffect } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "default" | "danger";
}

export const BaseModal = ({ isOpen, onClose, title, children, variant = "default" }: BaseModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${
          variant === "danger" ? "bg-rose-50" : "bg-white"
        }`}>
          <div className="flex items-center gap-2.5">
            {variant === "danger" && (
              <FiAlertTriangle size={15} className="text-rose-500 shrink-0" />
            )}
            <h3 className={`text-sm font-black uppercase tracking-widest ${
              variant === "danger" ? "text-rose-700" : "text-slate-900"
            }`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
