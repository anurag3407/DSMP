import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';
import './Toast.css';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle />,
    error: <IoCloseCircle />,
    warning: <IoWarning />,
    info: <IoInformationCircle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

export default Toast;
