import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "champagne" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-wide";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 rounded-sm gap-1.5",
    md: "text-sm px-5 py-2.5 rounded-sm gap-2",
    lg: "text-sm tracking-wider uppercase px-7 py-3.5 rounded-sm gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#0B0D12] text-[#FBF9F5] hover:bg-[#1A1E29] active:bg-[#000000] border border-transparent shadow-sm",
    champagne:
      "bg-[#C5A880] text-[#0B0D12] hover:bg-[#B39366] active:bg-[#A38350] border border-transparent font-semibold shadow-sm",
    outline:
      "bg-transparent text-[#0B0D12] border border-[#0B0D12]/20 hover:border-[#0B0D12] hover:bg-[#0B0D12]/[0.02]",
    ghost:
      "bg-transparent text-[#0B0D12] hover:bg-[#0B0D12]/[0.04]",
    danger:
      "bg-red-950/10 text-red-700 border border-red-200 hover:bg-red-700 hover:text-white",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
