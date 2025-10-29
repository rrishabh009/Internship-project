import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
}

export const Modal = ({ open, title, onClose, children }: PropsWithChildren<ModalProps>) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-modal focus:outline-none" tabIndex={-1}>
        <div className="mb-3 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button aria-label="Close" className="rounded p-1 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" onClick={onClose}>✕</button>
        </div>
        <div id="modal-description" className="text-sm text-neutral-600">
          {children}
        </div>
      </div>
    </div>
  );
};