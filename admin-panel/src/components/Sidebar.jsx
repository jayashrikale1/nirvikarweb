import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Nav } from 'react-bootstrap';

const Sidebar = ({ className = '', style = {}, onNavigate }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Products', path: '/products', icon: ShoppingBag },
  ];

  return (
    <div 
      className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${className}`} 
      style={{ minHeight: '100vh', ...style }}
    >
      <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4 fw-bold">Nirvikar Admin</span>
      </Link>
      <hr />
      <Nav variant="pills" className="flex-column mb-auto">
        {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = location.pathname.startsWith(item.path);
           return (
            <Nav.Item key={item.path} className="mb-1">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white'}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
              >
                <Icon className="me-2" size={18} />
                {item.name}
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>
      <hr />
      <div className="dropdown">
        <button
          onClick={logout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
        >
          <LogOut className="me-2" size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
