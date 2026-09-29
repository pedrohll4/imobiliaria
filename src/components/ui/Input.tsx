import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs uppercase tracking-wider font-medium text-[#4A4742]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-2.5 rounded-sm border border-[#0F1115]/15 transition-all duration-200 placeholder:text-[#8C8983] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 disabled:bg-[#F4F1EA] disabled:cursor-not-allowed",
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
