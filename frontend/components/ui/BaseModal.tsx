import { FaTimes } from "react-icons/fa";
import { ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "default" | "danger";
}

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  variant = "default",
}: BaseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            variant === "danger" ? "bg-red-50" : "bg-white"
          }`}
        >
          <h3
            className={`text-xl font-bold ${
              variant === "danger" ? "text-red-700" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
