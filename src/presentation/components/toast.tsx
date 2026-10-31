import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './toast.css';

const TOAST_DURATION_MS = 2500;

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  // On <body>, because the moving screen track would otherwise carry it along.
  return createPortal(
    <div className="toast" role="status">
      {message}
    </div>,
    document.body,
  );
}
