import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export interface FormLabelProps {
  children: ReactNode;
}

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add custom props here if needed, like 'error' or 'icon'

  register: UseFormRegisterReturn;
  error?: string;
}

export interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  register: UseFormRegisterReturn;

  error?: string;
}

export interface FormButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export interface SettingsSidebarProps {
  activeTab: string;
}

//interface for the basic user settings form
export interface BasicSettingsFormValue {
  full_name: string;
  bio: string;
}
