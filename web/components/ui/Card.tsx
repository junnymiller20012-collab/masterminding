import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export function Card({ compact = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm",
        compact ? "p-4" : "p-6",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
