import type {
  HTMLAttributes,
  ReactNode,
} from "react";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
  {...props}
  className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
>
      {children}
    </div>
  );
}