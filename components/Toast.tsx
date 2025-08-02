import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
  duration?: number;
}

const icons: Record<ToastType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  success: CheckCircleIcon,
  error: AlertTriangleIcon,
  info: InfoIcon,
};

const toastColors: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss, duration = 5000 }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 300);
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-center p-4 mb-3 text-white rounded-md shadow-lg transition-all duration-300 transform ${toastColors[type]} ${exiting ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-3 mr-auto text-sm font-medium">
        {message}
      </div>
      <button
        onClick={handleDismiss}
        className="ml-4 p-1 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
