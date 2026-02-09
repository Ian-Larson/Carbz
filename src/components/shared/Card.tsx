import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl bg-white border border-gray-100 shadow-sm p-4 ${className}`}>
      {title && (
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
