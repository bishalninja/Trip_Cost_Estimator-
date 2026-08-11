import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, error, className = "", ...rest }, ref) => {
    return (
      <label className="mb-3 block">
        <span className="text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        <input
          ref={ref}
          {...rest}
          className={`mt-1 w-full rounded-md border px-3 py-2.5 text-base outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400 sm:text-sm ${
            error ? "border-red-400" : "border-gray-300"
          } ${className}`}
        />
        {error && <span className="mt-1 block text-xs text-red-600">{error.message}</span>}
      </label>
    );
  }
);

Input.displayName = "Input";

export default Input;
