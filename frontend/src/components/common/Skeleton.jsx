import React from 'react';
import PropTypes from 'prop-types';
import './Skeleton.css';

export const SkeletonText = ({ width = '100%', height = '16px', className = '' }) => (
  <div className={`skeleton skeleton-text ${className}`} style={{ width, height }} />
);

export const SkeletonAvatar = ({ size = 48, className = '' }) => (
  <div 
    className={`skeleton skeleton-avatar ${className}`} 
    style={{ width: size, height: size }} 
  />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton-card-header">
      <SkeletonAvatar size={48} />
      <div className="skeleton-card-info">
        <SkeletonText width="120px" height="18px" />
        <SkeletonText width="80px" height="14px" />
      </div>
    </div>
    <SkeletonText width="100%" height="200px" className="skeleton-card-image" />
    <SkeletonText width="100%" height="16px" />
    <SkeletonText width="80%" height="16px" />
  </div>
);

SkeletonText.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string
};

SkeletonAvatar.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string
};

SkeletonCard.propTypes = {
  className: PropTypes.string
};
