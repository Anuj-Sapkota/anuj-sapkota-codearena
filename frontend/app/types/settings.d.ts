import { InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export interface FormLabelProps {
  children: ReactNode;
}

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Add custom props here if needed, like 'error' or 'icon'
  error?: string;
}

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export interface SettingsSidebarProps {
  activeTab: string;
}