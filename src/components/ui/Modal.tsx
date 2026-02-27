'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

/** Bottom sheet modal — native mobile feel */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
  showHandle = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        style={{ maxWidth: '100vw' }}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      />

      {/* Sheet */}
      <div
        className={cn(
          'bottom-sheet animate-slide-up z-50',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Drag handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-5 py-4">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-text-secondary hover:text-text-primary transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {children}
      </div>
    </>
  );
}

/** Simple inline modal for confirmations */
export function ModalSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 pb-5', className)}>
      {children}
    </div>
  );
}
