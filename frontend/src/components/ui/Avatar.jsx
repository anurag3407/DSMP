import React from 'react';
import PropTypes from 'prop-types';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 48, 
  online = false,
  className = '' 
}) => {
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`;
  
  return (
    <div 
      className={`avatar ${className}`} 
      style={{ width: size, height: size }}
    >
      <img 
        src={src || defaultAvatar} 
        alt={alt}
        className="circle-avatar"
        onError={(e) => {
          e.target.src = defaultAvatar;
        }}
      />
      {online && <span className="avatar-online-badge" />}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
  online: PropTypes.bool,
  className: PropTypes.string
};

export default Avatar;
