import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Pagination } from 'react-bootstrap';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ category_name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (query = '', page = 1) => {
    try {
      const response = await api.get('/categories', { params: { search: query, page, limit: 10 } });
      setCategories(response.data.categories);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(searchQuery, 1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories(searchQuery, currentPage);
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({ category_name: category.category_name });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
          category_name: formData.category_name
      };

      if (isEditing) {
        await api.put(`/categories/${currentCategory.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      setFormData({ category_name: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories(searchQuery, currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ category_name: '' });
    setIsEditing(false);
    setCurrentCategory(null);
  };

  return (
    <Layout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Categories</h2>
          <Button
            variant="primary"
            onClick={() => {
                setIsEditing(false);
                setFormData({ category_name: '' });
                setShowModal(true);
            }}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={16} />
            Add Category
          </Button>
        </div>

        <Form onSubmit={handleSearch} className="mb-4">
            <Row>
                <Col md={8} lg={6}>
                    <div className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Search by category name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" variant="outline-primary">Search</Button>
                    </div>
                </Col>
            </Row>
        </Form>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-3 text-muted">{category.id}</td>
                      <td className="px-4 py-3 fw-medium">{category.category_name}</td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="link"
                          className="text-primary p-0 me-3"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                      <tr>
                          <td colSpan="3" className="text-center py-4 text-muted">No categories found.</td>
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
                    <Pagination.First onClick={() => fetchCategories(searchQuery, 1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => fetchCategories(searchQuery, currentPage - 1)} disabled={currentPage === 1} />
                    
                    {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item 
                            key={idx + 1} 
                            active={idx + 1 === currentPage}
                            onClick={() => fetchCategories(searchQuery, idx + 1)}
                        >
                            {idx + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next onClick={() => fetchCategories(searchQuery, currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => fetchCategories(searchQuery, totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        )}

        <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" className="modal-main-content">
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form id="category-form" onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="category-form">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Categories;
