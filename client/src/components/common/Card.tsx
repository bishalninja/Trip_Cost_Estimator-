import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 p-3.5 sm:p-4 ${className}`}>
      {title && (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
