import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "h-10 px-3 rounded-lg border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800",
            "placeholder:text-slate-400",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2 dark:focus:ring-offset-slate-900",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
