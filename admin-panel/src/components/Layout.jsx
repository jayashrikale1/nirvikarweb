import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Container, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const handleClose = () => setShowMobileSidebar(false);
    const handleShow = () => setShowMobileSidebar(true);

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Desktop Sidebar */}
      <div className="d-none d-md-block" style={{ width: '280px' }}>
          <Sidebar />
      </div>

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showMobileSidebar} onHide={handleClose} responsive="lg" className="d-md-none bg-dark text-white" style={{ maxWidth: '280px' }}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
            <Sidebar 
                style={{ height: '100%', minHeight: '0' }} 
                onNavigate={handleClose} 
            />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Navbar bg="white" className="shadow-sm px-3 px-md-4 justify-content-between">
            <div className="d-flex align-items-center">
                <Button 
                    variant="link" 
                    className="d-md-none p-0 me-3 text-dark" 
                    onClick={handleShow}
                >
                    <Menu size={24} />
                </Button>
                <Navbar.Brand className="fw-bold text-dark d-md-none">Nirvikar</Navbar.Brand>
                <h4 className="m-0 d-none d-md-block">Admin Panel</h4>
            </div>
            
            <div className="d-flex align-items-center">
                <span className="text-secondary me-2 d-none d-sm-inline">Welcome,</span>
                <span className="fw-medium text-dark">{user?.name}</span>
            </div>
        </Navbar>
        <Container fluid className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout;
