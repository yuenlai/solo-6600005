import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const getToastStyle = (type: string) => {
    const baseStyle: React.CSSProperties = {
      padding: '12px 20px',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '280px',
      animation: 'slideIn 0.3s ease-out',
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: 'linear-gradient(135deg, #4caf50, #45a049)' };
      case 'error':
        return { ...baseStyle, background: 'linear-gradient(135deg, #f44336, #d32f2f)' };
      case 'info':
        return { ...baseStyle, background: 'linear-gradient(135deg, #2196f3, #1976d2)' };
      default:
        return baseStyle;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      default: return '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          style={getToastStyle(toast.type)}
          icon={getIcon(toast.type)}
        />
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
  style: React.CSSProperties;
  icon: string;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, style, icon }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      style={{
        ...style,
        animation: isExiting ? 'slideOut 0.3s ease-in forwards' : undefined,
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
};
