import React from 'react';
import logo from '../assets/logo.png';
import userIcon from '../assets/user.png';

const headerStyle = {
  backgroundColor: '#4ECDC4',
  width: '100%',
  padding: 0,
  margin: 0,
  boxShadow: 'none'
};

const contentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 30px',
  maxWidth: '100%',
  margin: '0 auto',
  flexWrap: 'wrap'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const titleStyle = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: '700',
  color: '#2C3E50',
  fontSize: '32px',
  margin: 0,
  letterSpacing: '-1px'
};

const userContainerStyle = {
  display: 'flex',
  alignItems: 'center'
};

const userIconStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  padding: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const userImgStyle = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  objectFit: 'cover'
};

// Responsive adjustments
const getResponsiveStyles = () => {
  const width = window.innerWidth;
  let responsiveContentStyle = { ...contentStyle };
  let responsiveTitleStyle = { ...titleStyle };

  if (width < 600) {
    responsiveContentStyle.flexDirection = 'column';
    responsiveContentStyle.gap = '10px';
    responsiveContentStyle.padding = '10px 10px';
    responsiveTitleStyle.fontSize = '22px';
  }

  return { responsiveContentStyle, responsiveTitleStyle };
};

const LoginPageHeader = () => {
  const { responsiveContentStyle, responsiveTitleStyle } = getResponsiveStyles();

  return (
    <header style={headerStyle}>
      <div style={responsiveContentStyle}>
        <div style={logoStyle}>
          <img
            src={logo}
            alt="Nounce Logo"
            style={{
              height: window.innerWidth < 600 ? '35px' : '50px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
          <h1 style={responsiveTitleStyle}>Nounce</h1>
        </div>
        <div style={userContainerStyle}>
          <div style={userIconStyle}>
            <img src={userIcon} alt="User Profile" style={userImgStyle} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoginPageHeader;
