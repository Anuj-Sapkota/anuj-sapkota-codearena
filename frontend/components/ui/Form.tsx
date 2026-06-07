import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import type {
  FormLabelProps,
  FormInputProps,
  FormTextareaProps,
  FormButtonProps,
} from "@/types/settings.types";

export const FormLabel = ({ children }: FormLabelProps) => (
  <label className="text-xs font-black text-green-900/60 ml-1 tracking-widest uppercase">
    {children}
  </label>
);

export const FormInput = ({
  register,
  placeholder,
  error,
  type = "text",
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Check if this is actually a password field
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <input
        {...register}
        type={inputType}
        placeholder={placeholder}
        className={`w-full border-2 rounded-md p-4 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all shadow-sm ${
          error ? "border-red-500" : "border-gray-500"
        }`}
      />

      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[22px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}

      {error && (
        <span className="text-red-500 text-xs ml-1 font-medium">{error}</span>
      )}
    </div>
  );
};

export const FormTextarea = ({ register, placeholder }: FormTextareaProps) => (
  <div className="flex flex-col gap-1 w-full">
    <textarea
      {...register}
      placeholder={placeholder}
      className="w-full border-2 border-gray-500 rounded-md p-4 h-60 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all resize-none shadow-sm"
    />
  </div>
);

export const FormButton = ({
  children,
  isLoading,
  ...props
}: FormButtonProps) => (
  <button
    {...props}
    disabled={isLoading || props.disabled}
    className="group relative bg-gray-700 text-white px-12 py-4 rounded-md font-bold transition-all hover:shadow-2xl hover:shadow-primary-1/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
  >
    <span className="relative z-10">
      {isLoading ? "Processing..." : children}
    </span>
    {!isLoading && (
      <div className="absolute inset-0 bg-primary-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    )}
  </button>
);
