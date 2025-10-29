import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export const Button = ({ className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & { className?: string }) => (
  <button
    className={`inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 ${className}`}
    {...props}
  />
);