import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Eye, Trash2, Filter, Inbox, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Container, Card, Table, Button, Modal, Form, Badge, Pagination, Row, Col, Spinner } from 'react-bootstrap';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inquiries', { 
          params: { 
              page: currentPage, 
              limit: 10,
              status: statusFilter
          } 
      });
      setInquiries(response.data.inquiries);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await api.delete(`/inquiries/${id}`);
        toast.success('Inquiry deleted');
        fetchInquiries();
      } catch (error) {
        toast.error('Failed to delete inquiry');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/inquiries/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchInquiries();
      if (currentInquiry && currentInquiry.id === id) {
          setCurrentInquiry({ ...currentInquiry, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openDetails = (inquiry) => {
    setCurrentInquiry(inquiry);
    setShowModal(true);
    if (inquiry.status === 'new') {
        handleStatusChange(inquiry.id, 'read');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentInquiry(null);
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'new': return <Badge bg="danger" className="px-2 py-1">New</Badge>;
          case 'read': return <Badge bg="info" className="px-2 py-1">Read</Badge>;
          case 'contacted': return <Badge bg="warning" text="dark" className="px-2 py-1">Contacted</Badge>;
          case 'resolved': return <Badge bg="success" className="px-2 py-1">Resolved</Badge>;
          default: return <Badge bg="secondary" className="px-2 py-1">{status}</Badge>;
      }
  };

  return (
    <Layout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1 fw-bold text-dark">Inquiries</h2>
            <p className="text-muted mb-0">Manage customer messages and product inquiries</p>
          </div>
        </div>

        <Card className="shadow-sm border-0 mb-4 bg-white rounded-3">
            <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                    <Filter size={18} className="text-muted me-2" />
                    <Form.Select 
                        value={statusFilter} 
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ maxWidth: '200px' }}
                        className="border-0 bg-light fw-medium"
                    >
                        <option value="">All Inquiries</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                    </Form.Select>
                </div>
            </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading inquiries...</p>
          </div>
        ) : (
          <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold" style={{ width: '50px' }}>Sr No.</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Date</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Customer</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Contact</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Address</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Interest</th>
                    <th className="px-4 py-3 text-uppercase text-muted small fw-bold">Status</th>
                    <th className="px-4 py-3 text-end text-uppercase text-muted small fw-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length > 0 ? (
                    inquiries.map((inquiry, index) => (
                        <tr key={inquiry.id} className={inquiry.status === 'new' ? 'bg-light-primary' : ''}>
                        <td className="px-4 py-3 text-muted">{(currentPage - 1) * 10 + index + 1}</td>
                        <td className="px-4 py-3 text-nowrap">
                            <div className="d-flex align-items-center">
                                <Clock size={14} className="me-2 text-muted" />
                                <span>{new Date(inquiry.createdAt || inquiry.created_at).toLocaleDateString()}</span>
                            </div>
                            <small className="text-muted ms-4">{new Date(inquiry.createdAt || inquiry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                        </td>
                        <td className="px-4 py-3 fw-medium">{inquiry.name}</td>
                        <td className="px-4 py-3">
                            <div>{inquiry.phone}</div>
                            <small className="text-muted">{inquiry.email || '-'}</small>
                        </td>
                        <td className="px-4 py-3">
                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={inquiry.address || ''}>
                                {inquiry.address || '-'}
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            {inquiry.product ? (
                                <Badge bg="light" text="primary" className="border border-primary-subtle fw-normal">
                                    {inquiry.product.product_name}
                                </Badge>
                            ) : (
                                <span className="text-muted fst-italic">General Inquiry</span>
                            )}
                        </td>
                        <td className="px-4 py-3">
                            {getStatusBadge(inquiry.status)}
                        </td>
                        <td className="px-4 py-3">
                            <div className="d-flex align-items-center justify-content-end gap-2">
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => openDetails(inquiry)}
                                    title="View Details"
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="text-danger rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => handleDelete(inquiry.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </td>
                        </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="7" className="text-center py-5">
                            <div className="text-muted d-flex flex-column align-items-center">
                                <Inbox size={48} className="mb-3 opacity-25" />
                                <p className="mb-0">No inquiries found.</p>
                            </div>
                        </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                    
                    {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item 
                            key={idx + 1} 
                            active={idx + 1 === currentPage}
                            onClick={() => setCurrentPage(idx + 1)}
                        >
                            {idx + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="modal-with-sidebar">
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="fw-bold">
                <MessageSquare size={20} className="me-2 text-primary" />
                Inquiry Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {currentInquiry && (
                <div className="p-2">
                    <Row className="mb-4">
                        <Col md={12}>
                            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                                <div>
                                    <h5 className="mb-1">{currentInquiry.name}</h5>
                                    <div className="text-muted small">
                                        Submitted on {new Date(currentInquiry.createdAt || currentInquiry.created_at).toLocaleString()}
                                    </div>
                                </div>
                                {getStatusBadge(currentInquiry.status)}
                            </div>
                        </Col>
                    </Row>
                    
                    <Row className="mb-4">
                        <Col md={6}>
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Contact Info</h6>
                            <p className="mb-1"><strong>Phone:</strong> {currentInquiry.phone}</p>
                            <p className="mb-1"><strong>Email:</strong> {currentInquiry.email || 'N/A'}</p>
                            <p className="mb-0"><strong>Address:</strong> {currentInquiry.address || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Interest</h6>
                            <p className="mb-0 text-primary fw-medium">
                                {currentInquiry.product ? currentInquiry.product.product_name : 'General Inquiry'}
                            </p>
                        </Col>
                    </Row>

                    <div className="mb-4">
                        <h6 className="text-uppercase text-muted small fw-bold mb-2">Message</h6>
                        <div className="bg-light p-4 rounded border text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                            {currentInquiry.message || 'No message content.'}
                        </div>
                    </div>
                    
                    <hr className="my-4" />
                    
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <CheckCircle size={18} className="text-success me-2" />
                            <strong className="me-3">Update Status:</strong>
                        </div>
                        <Form.Select 
                            style={{ width: '200px' }}
                            value={currentInquiry.status}
                            onChange={(e) => handleStatusChange(currentInquiry.id, e.target.value)}
                            className="form-select-sm"
                        >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                        </Form.Select>
                    </div>
                </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0 pb-3 pe-4">
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Inquiries;
