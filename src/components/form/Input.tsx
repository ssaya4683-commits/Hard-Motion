import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>

        <input
          ref={ref}
          {...props}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${className}`}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;