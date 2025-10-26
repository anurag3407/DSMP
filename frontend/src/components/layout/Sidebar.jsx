import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IoHomeOutline, 
  IoHome,
  IoNotificationsOutline, 
  IoNotifications,
  IoChatbubbleOutline, 
  IoChatbubble,
  IoLogOutOutline,
  IoPersonOutline
} from 'react-icons/io5';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import './Sidebar.css';

const Sidebar = ({ user, recommendedUsers = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/home', 
      label: 'Home', 
      icon: IoHomeOutline, 
      activeIcon: IoHome 
    },
    { 
      path: '/notifications', 
      label: 'Notifications', 
      icon: IoNotificationsOutline, 
      activeIcon: IoNotifications 
    },
    { 
      path: '/messages', 
      label: 'Messages', 
      icon: IoChatbubbleOutline, 
      activeIcon: IoChatbubble 
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* User Profile */}
        <div className="sidebar-profile" onClick={() => navigate(`/profile/${user?.walletAddress}`)}>
          <Avatar 
            src={user?.profilePicture?.url} 
            alt={user?.name} 
            size={84} 
          />
          <h3 className="sidebar-username">{user?.name}</h3>
          <p className="sidebar-wallet">{truncateAddress(user?.walletAddress)}</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
          
          <button className="nav-item nav-item-logout" onClick={handleLogout}>
            <IoLogOutOutline className="nav-icon" />
            <span className="nav-label">Log Out</span>
          </button>
        </nav>

        {/* Recommended Users */}
        {recommendedUsers.length > 0 && (
          <Card className="recommended-section" padding="md">
            <h4 className="recommended-title">Recommended For You</h4>
            <div className="recommended-list">
              {recommendedUsers.slice(0, 5).map((recommendedUser) => (
                <div 
                  key={recommendedUser._id}
                  className="recommended-user"
                  onClick={() => navigate(`/profile/${recommendedUser.walletAddress}`)}
                >
                  <Avatar 
                    src={recommendedUser.profilePicture?.url} 
                    alt={recommendedUser.name} 
                    size={40} 
                  />
                  <div className="recommended-info">
                    <p className="recommended-name">{recommendedUser.name}</p>
                    <p className="recommended-wallet">
                      {truncateAddress(recommendedUser.walletAddress)}
                    </p>
                  </div>
                  <button className="recommended-follow-btn">
                    <IoPersonOutline />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
