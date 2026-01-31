import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Container, Row, Col, Card, Table, Button, Modal, Form } from 'react-bootstrap';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', parent_id: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({ name: category.name, parent_id: category.parent_id || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
          name: formData.name, 
          parent_id: formData.parent_id === '' ? null : formData.parent_id 
      };

      if (isEditing) {
        await api.put(`/categories/${currentCategory.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      setFormData({ name: '', parent_id: '' });
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', parent_id: '' });
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
                setFormData({ name: '', parent_id: '' });
                setShowModal(true);
            }}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={16} />
            Add Category
          </Button>
        </div>

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
                    <th className="px-4 py-3">Parent Category</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-3 text-muted">{category.id}</td>
                      <td className="px-4 py-3 fw-medium">{category.name}</td>
                      <td className="px-4 py-3 text-muted">
                          {categories.find(c => c.id === category.parent_id)?.name || '-'}
                      </td>
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
                          <td colSpan="4" className="text-center py-4 text-muted">No categories found.</td>
                      </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Parent Category (Optional)</Form.Label>
                <Form.Select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">None</option>
                  {categories
                    .filter(c => c.id !== currentCategory?.id) // Prevent self-parenting
                    .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Categories;
