import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../ui/Toast';
import './ToastContainer.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = React.useRef(0);

  const showToast = useCallback((type, message) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message) => showToast('success', message),
    error: (message) => showToast('error', message),
    warning: (message) => showToast('warning', message),
    info: (message) => showToast('info', message)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(({ id, type, message }) => (
          <Toast
            key={id}
            type={type}
            message={message}
            onClose={() => removeToast(id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
