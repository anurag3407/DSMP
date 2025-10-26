import React from 'react';
import PropTypes from 'prop-types';
import './Loading.css';

const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <div className="loading-content">
      <div className="loading-spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  return content;
};

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  message: PropTypes.string
};

export default Loading;
