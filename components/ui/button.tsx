"use client";

import * as React from "react";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[#1A3C6E] text-white hover:bg-[#3B82F6] focus-visible:ring-[#3B82F6]",
  secondary:
    "bg-[#3B82F6]/10 text-[#1A3C6E] hover:bg-[#3B82F6]/20 focus-visible:ring-[#3B82F6]",
  outline:
    "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F5F3EE] focus-visible:ring-[#3B82F6]",
  ghost:
    "text-[#111827] hover:bg-[#F5F3EE] focus-visible:ring-[#3B82F6]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 rounded-md px-3 text-xs",
  lg: "h-11 rounded-xl px-6 text-base",
  icon: "h-10 w-10",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    />
  );
}
