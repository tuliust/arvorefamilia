import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const getButtonClasses = (variant: ButtonProps['variant'] = 'default', size: ButtonProps['size'] = 'default') => {
  const variantClasses = {
    default: 'border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50',
    ghost: 'border border-transparent text-gray-700 hover:bg-gray-100',
    destructive: 'border border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700',
  };

  const sizeClasses = {
    default: 'min-h-10 px-4 py-2',
    sm: 'min-h-9 px-3 py-1.5 text-sm',
    lg: 'min-h-11 px-6 py-2.5 sm:px-8',
    icon: 'h-10 w-10 p-0',
  };

  return cn(variantClasses[variant], sizeClasses[size]);
};

export function buttonVariants(props?: { variant?: ButtonProps['variant'], size?: ButtonProps['size'] }) {
  return getButtonClasses(props?.variant, props?.size);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg text-center font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0 [&>svg:not([class*='h-'])]:h-4 [&>svg:not([class*='w-'])]:w-4",
          getButtonClasses(variant, size),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
