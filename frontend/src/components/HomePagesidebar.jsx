import React from 'react';
import './HomePagesidebar.css';
import avatarImg from '../assets/user.png';

const SidebarItem = ({ icon, label }) => (
  <div className="sidebar-item">
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-label">{label}</span>
  </div>
);

const HomePagesidebar = ({ user = { name: 'Rahul Yadav', id: 'id - 0xF8a34cde9657' } }) => {
  return (
    <aside className="sidebar">
      <div className="profile-card">
        <div className="profile-avatar">
          <img src={avatarImg} alt={user.name} />
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-id">{user.id}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <SidebarItem icon="🏠" label="Home" />
        <SidebarItem icon="🔔" label="Notifications" />
        <SidebarItem icon="✉️" label="Messages" />
      </nav>

      <div className="sidebar-logout">
        <button className="logout-btn">Log Out</button>
      </div>
    </aside>
  );
};

export default HomePagesidebar;
