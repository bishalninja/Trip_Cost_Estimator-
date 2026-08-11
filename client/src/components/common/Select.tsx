import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
  error?: FieldError;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, required, options, error, className = "", ...rest }, ref) => {
    return (
      <label className="mb-3 block">
        <span className="text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        <select
          ref={ref}
          {...rest}
          className={`mt-1 w-full rounded-md border bg-white px-3 py-2.5 text-base outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400 sm:text-sm ${
            error ? "border-red-400" : "border-gray-300"
          } ${className}`}
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <span className="mt-1 block text-xs text-red-600">{error.message}</span>}
      </label>
    );
  }
);

Select.displayName = "Select";

export default Select;
