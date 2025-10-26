import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  hoverable = false,
  onClick
}) => {
  return (
    <div 
      className={`card-component card-padding-${padding} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hoverable: PropTypes.bool,
  onClick: PropTypes.func
};

export default Card;
