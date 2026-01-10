import React from "react";
import { FormLabelProps, FormInputProps, FormTextareaProps, FormButtonProps } from "@/app/types/settings";

export const FormLabel = ({ children }: FormLabelProps) => (
  <label className="text-xs font-black text-green-900/60 ml-1 tracking-widest uppercase">
    {children}
  </label>
);

export const FormInput = (props: FormInputProps) => (
  <div className="flex flex-col gap-1 w-full">
    <input
      {...props}
      className={`w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all shadow-sm ${
        props.error ? "border-red-500" : "border-gray-200"
      }`}
    />
    {props.error && <span className="text-red-500 text-xs ml-1">{props.error}</span>}
  </div>
);

export const FormTextarea = (props: FormTextareaProps) => (
  <div className="flex flex-col gap-1 w-full">
    <textarea
      {...props}
      className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all resize-none shadow-sm"
    />
  </div>
);

export const FormButton = ({ children, isLoading, ...props }: FormButtonProps) => (
  <button
    {...props}
    disabled={isLoading || props.disabled}
    className="group relative bg-gray-700 text-white px-12 py-4 rounded-md font-bold transition-all hover:shadow-2xl hover:shadow-primary-1/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-70"
  >
    <span className="relative z-10">{isLoading ? "Processing..." : children}</span>
    {!isLoading && (
      <div className="absolute inset-0 bg-primary-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    )}
  </button>
);