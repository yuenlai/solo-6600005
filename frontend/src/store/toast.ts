import { create } from 'zustand';
import type { ToastMessage } from '../components/Toast';

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set({ toasts: [...get().toasts, { ...toast, id }] });
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
  success: (message, duration) => {
    get().addToast({ type: 'success', message, duration });
  },
  error: (message, duration) => {
    get().addToast({ type: 'error', message, duration });
  },
  info: (message, duration) => {
    get().addToast({ type: 'info', message, duration });
  },
  warning: (message, duration) => {
    get().addToast({ type: 'info', message, duration: duration || 8000 });
  },
}));
