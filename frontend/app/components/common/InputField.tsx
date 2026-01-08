import { InputFieldProps } from "@/app/types/auth";
import React from "react";

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  register,
  errors,
}) => {
  return (
    <div className="w-full">
      <input
        {...register}
        type={type}
        id={name}
        autoComplete={name === "identifier" ? "username" : "current-password"}
        placeholder={label || name} 
        className={`w-full border rounded-md px-4 py-2 outline-none transition-all
          
          /* Light Mode Colors */
          bg-white text-gray-900 
          placeholder:text-gray-400 placeholder:opacity-100
          
          /* Border Logic */
          ${errors[name] 
            ? "border-red-500 focus:ring-red-500" 
            : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }
        `}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default InputField;