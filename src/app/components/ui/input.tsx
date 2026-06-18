import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PLACEHOLDER_OVERRIDES: Record<string, string> = {
  "Ex: jornalista, professora, médico, empresário...": "Ex: Jornalista, Dona de Casa, etc",
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, placeholder, ...props }, ref) => {
    const normalizedPlaceholder = typeof placeholder === "string"
      ? PLACEHOLDER_OVERRIDES[placeholder] ?? placeholder
      : placeholder;

    return (
      <input
        type={type}
        placeholder={normalizedPlaceholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base ring-offset-white md:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
