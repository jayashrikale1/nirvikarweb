import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Layers, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Nav } from 'react-bootstrap';
import logo from '../assets/logo.png';

const Sidebar = ({ className = '', style = {}, onNavigate }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Change Password', path: '/change-password', icon: KeyRound },
  ];

  return (
    <div 
      className={`d-flex flex-column flex-shrink-0 p-4 text-white sidebar-wrapper ${className}`} 
      style={{ minHeight: '100%', ...style }}
    >
      <Link to="/" className="d-flex align-items-center justify-content-center mb-5 text-white text-decoration-none w-100">
        <div className="bg-white p-2 rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ width: '110px', height: '110px' }}>
          <img 
            src={logo} 
            alt="Nirvikar" 
            style={{ width: '90px', height: '90px', objectFit: 'contain' }}
          />
        </div>
      </Link>
      
      <Nav variant="pills" className="flex-column mb-auto gap-2">
        {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = location.pathname.startsWith(item.path);
           return (
            <Nav.Item key={item.path}>
              <Link
                to={item.path}
                className={`nav-link-custom ${isActive ? 'active' : ''} text-decoration-none`}
                onClick={onNavigate}
              >
                <Icon className="me-3" size={20} />
                <span>{item.name}</span>
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>
      
      <div className="mt-5 pt-3 border-top border-secondary border-opacity-25">
        <button
          onClick={logout}
          className="btn w-100 d-flex align-items-center justify-content-center logout-btn"
        >
          <LogOut className="me-2" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
