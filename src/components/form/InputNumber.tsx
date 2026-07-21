import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

interface InputNumberProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputNumber = forwardRef<
  HTMLInputElement,
  InputNumberProps
>(({ label, className = "", ...props }, ref) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        ref={ref}
        type="number"
        {...props}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${className}`}
      />
    </div>
  );
});

InputNumber.displayName = "InputNumber";

export default InputNumber;