import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Eye, Trash2 } from 'lucide-react';
import { Container, Card, Table, Button, Modal, Form, Badge, Pagination, Row, Col } from 'react-bootstrap';

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
      
      // Update local state to reflect change immediately without refetching everything if we want,
      // or just refetch. Refetching is safer.
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
    // Optionally mark as read if it's new
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
          case 'new': return <Badge bg="danger">New</Badge>;
          case 'read': return <Badge bg="info">Read</Badge>;
          case 'contacted': return <Badge bg="warning" text="dark">Contacted</Badge>;
          case 'resolved': return <Badge bg="success">Resolved</Badge>;
          default: return <Badge bg="secondary">{status}</Badge>;
      }
  };

  return (
    <Layout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Inquiries</h2>
        </div>

        <Card className="shadow-sm mb-4">
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Filter by Status</Form.Label>
                            <Form.Select 
                                value={statusFilter} 
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="contacted">Contacted</option>
                                <option value="resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Product Interest</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td className="px-4 py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                          {new Date(inquiry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 fw-medium">{inquiry.name}</td>
                      <td className="px-4 py-3">{inquiry.phone}</td>
                      <td className="px-4 py-3 text-muted">
                          {inquiry.product ? inquiry.product.product_name : 'General Inquiry'}
                      </td>
                      <td className="px-4 py-3">
                          {getStatusBadge(inquiry.status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="link"
                          className="text-primary p-0 me-3"
                          onClick={() => openDetails(inquiry)}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDelete(inquiry.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {inquiries.length === 0 && (
                      <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">No inquiries found.</td>
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

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Inquiry Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentInquiry && (
                <div>
                    <Row className="mb-3">
                        <Col md={6}>
                            <strong>Name:</strong> <p>{currentInquiry.name}</p>
                        </Col>
                        <Col md={6}>
                            <strong>Date:</strong> <p>{new Date(currentInquiry.created_at).toLocaleString()}</p>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <strong>Email:</strong> <p>{currentInquiry.email || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <strong>Phone:</strong> <p>{currentInquiry.phone}</p>
                        </Col>
                    </Row>
                    <div className="mb-3">
                        <strong>Product Interest:</strong>
                        <p className="text-primary">{currentInquiry.product ? currentInquiry.product.product_name : 'General Inquiry'}</p>
                    </div>
                    <div className="mb-4">
                        <strong>Message:</strong>
                        <div className="p-3 bg-light rounded mt-1">
                            {currentInquiry.message || 'No message content.'}
                        </div>
                    </div>
                    
                    <hr />
                    
                    <div className="d-flex align-items-center gap-3">
                        <strong>Update Status:</strong>
                        <Form.Select 
                            style={{ width: 'auto' }}
                            value={currentInquiry.status}
                            onChange={(e) => handleStatusChange(currentInquiry.id, e.target.value)}
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
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Inquiries;
