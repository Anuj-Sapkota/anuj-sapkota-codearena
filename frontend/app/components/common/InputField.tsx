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
    <div>
      <input
        type={type}
        name={name}
        {...register}
        autoComplete={name === "identifier" ? "username" : "current-password"}
        placeholder={label}
        className={`w-full max-w-md border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none   ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default InputField;
