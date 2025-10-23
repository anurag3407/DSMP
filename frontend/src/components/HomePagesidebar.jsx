import React from 'react';
import './HomePagesidebar.css';
import avatarImg from '../assets/user.png';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, label }) => (
  <div className="sidebar-item">
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-label">{label}</span>
  </div>
);

const HomePagesidebar = ({ userAddress, profile, balance, onLogout, onProfileClick }) => {
  const displayName = profile ? profile.username : 'Loading...';
  const displayId = userAddress ? `id - ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'id - Loading...';
  const displayBalance = balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Balance: Loading...';

  const Wrapper = onProfileClick
    ? ({ children }) => (
        <div className="profile-card" onClick={onProfileClick} role="button" tabIndex={0} onKeyPress={(e)=>{ if(e.key === 'Enter') onProfileClick && onProfileClick() }} style={{ cursor: 'pointer' }}>{children}</div>
      )
    : ({ children }) => (
        <Link to="/profile" className="profile-card" style={{ textDecoration: 'none', color: 'inherit' }}>{children}</Link>
      )

  return (
    <aside className="sidebar">
      <Wrapper>
        <div className="profile-avatar">
          <img src={avatarImg} alt={displayName} />
        </div>
        <div className="profile-info">
          <div className="profile-name">{displayName}</div>
          <div className="profile-id">{displayId}</div>
          <div className="profile-balance">{displayBalance}</div>
        </div>
      </Wrapper>

      <nav className="sidebar-nav">
        <SidebarItem icon="🏠" label="Home" />
        <SidebarItem icon="🔔" label="Notifications" />
        <SidebarItem icon="✉️" label="Messages" />
      </nav>

      <div className="sidebar-logout">
        <button className="logout-btn" onClick={onLogout}>Log Out</button>
      </div>
    </aside>
  );
};

export default HomePagesidebar;
