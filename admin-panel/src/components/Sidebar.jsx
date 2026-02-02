import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Layers, LogOut, KeyRound, Settings, User, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Nav, Collapse } from 'react-bootstrap';
import logo from '../assets/logo.png';

const Sidebar = ({ className = '', style = {}, onNavigate }) => {
  const { logout } = useAuth();
  const location = useLocation();
  
  // Check if current path is a setting path to auto-open
  const isSettingsActive = location.pathname === '/profile' || location.pathname === '/change-password';
  const [openSettings, setOpenSettings] = useState(isSettingsActive);

  const isActive = (path) => location.pathname === path;

  const toggleSettings = () => setOpenSettings(!openSettings);

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
        <Nav.Item>
          <Link
            to="/dashboard"
            className={`nav-link-custom ${isActive('/dashboard') ? 'active' : ''} text-decoration-none`}
            onClick={onNavigate}
          >
            <LayoutDashboard className="me-3" size={20} />
            <span>Dashboard</span>
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/categories"
            className={`nav-link-custom ${isActive('/categories') ? 'active' : ''} text-decoration-none`}
            onClick={onNavigate}
          >
            <Layers className="me-3" size={20} />
            <span>Categories</span>
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/products"
            className={`nav-link-custom ${isActive('/products') ? 'active' : ''} text-decoration-none`}
            onClick={onNavigate}
          >
            <ShoppingBag className="me-3" size={20} />
            <span>Products</span>
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/inquiries"
            className={`nav-link-custom ${isActive('/inquiries') ? 'active' : ''} text-decoration-none`}
            onClick={onNavigate}
          >
            <MessageSquare className="me-3" size={20} />
            <span>Inquiries</span>
          </Link>
        </Nav.Item>

        {/* Settings Dropdown */}
        <Nav.Item>
          <div 
            className={`nav-link-custom ${openSettings ? 'bg-white bg-opacity-10' : ''} text-decoration-none cursor-pointer d-flex justify-content-between align-items-center`}
            onClick={toggleSettings}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center">
                <Settings className="me-3" size={20} />
                <span>Settings</span>
            </div>
            {openSettings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          
          <Collapse in={openSettings}>
            <div className="ps-3 mt-1">
                <Link
                    to="/profile"
                    className={`nav-link-custom py-2 mb-1 ${isActive('/profile') ? 'active' : ''} text-decoration-none`}
                    style={{ fontSize: '0.95rem' }}
                    onClick={onNavigate}
                >
                    <User className="me-3" size={18} />
                    <span>Profile Update</span>
                </Link>
                <Link
                    to="/change-password"
                    className={`nav-link-custom py-2 ${isActive('/change-password') ? 'active' : ''} text-decoration-none`}
                    style={{ fontSize: '0.95rem' }}
                    onClick={onNavigate}
                >
                    <KeyRound className="me-3" size={18} />
                    <span>Change Password</span>
                </Link>
            </div>
          </Collapse>
        </Nav.Item>
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
