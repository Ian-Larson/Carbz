import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] ${className}`}>
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
