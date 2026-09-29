import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "champagne" | "dark" | "sand" | "outline" | "success" | "warning";
}

export function Badge({
  children,
  className,
  variant = "sand",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-xs select-none border transition-colors";

  const variantStyles = {
    champagne: "bg-[#D4AF37]/15 text-[#9B7826] border-[#D4AF37]/30",
    dark: "bg-[#0B0D12] text-[#FBF9F5] border-[#0B0D12]",
    sand: "bg-[#F4F1EA] text-[#4A4742] border-[#E8E4DA]",
    outline: "bg-transparent text-[#0F1115] border-[#0F1115]/15",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
}
