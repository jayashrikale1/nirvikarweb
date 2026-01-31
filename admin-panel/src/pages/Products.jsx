import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Card, Table, Button, Modal, Form, Row, Col, Image } from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, control } = useForm({
    defaultValues: {
      has_variant: false,
      specifications: [{ key: '', value: '' }] // Helper for JSON
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications"
  });

  const hasVariant = watch('has_variant');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    
    // Parse specs for form
    let specs = [];
    if (product.specifications_json) {
        if (typeof product.specifications_json === 'string') {
            try {
                const parsed = JSON.parse(product.specifications_json);
                specs = Object.entries(parsed).map(([key, value]) => ({ key, value }));
            } catch (e) {}
        } else {
             specs = Object.entries(product.specifications_json).map(([key, value]) => ({ key, value }));
        }
    }
    if (specs.length === 0) specs.push({ key: '', value: '' });

    reset({
      category_id: product.category_id,
      product_name: product.product_name,
      has_variant: product.has_variant,
      variant_name: product.variant_name,
      variant_values: product.variant_values,
      specifications: specs
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('category_id', data.category_id);
    formData.append('product_name', data.product_name);
    formData.append('has_variant', data.has_variant);
    
    if (data.has_variant) {
      formData.append('variant_name', data.variant_name);
      formData.append('variant_values', data.variant_values);
    }

    // Convert specs array back to JSON object
    const specsObj = {};
    data.specifications.forEach(spec => {
      if (spec.key && spec.value) {
        specsObj[spec.key] = spec.value;
      }
    });
    formData.append('specifications_json', JSON.stringify(specsObj));

    if (data.main_image && data.main_image[0]) {
      formData.append('main_image', data.main_image[0]);
    }
    
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i]);
      }
    }

    try {
      if (isEditing) {
        await api.put(`/products/${currentProduct.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created');
      }
      setShowModal(false);
      reset();
      setIsEditing(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset({ has_variant: false, specifications: [{ key: '', value: '' }] });
    setIsEditing(false);
    setCurrentProduct(null);
  };

  return (
    <Layout>
      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Products</h2>
          <Button
            variant="primary"
            onClick={() => {
                setIsEditing(false);
                reset({ has_variant: false, specifications: [{ key: '', value: '' }] });
                setShowModal(true);
            }}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={16} />
            Add Product
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
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Variants</th>
                    <th className="px-4 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                          {product.main_image ? (
                              <Image src={`http://localhost:5000/${product.main_image}`} alt={product.product_name} rounded style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                          ) : (
                              <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px', fontSize: '10px' }}>No Img</div>
                          )}
                      </td>
                      <td className="px-4 py-3 fw-medium align-middle">{product.product_name}</td>
                      <td className="px-4 py-3 text-muted align-middle">
                          {categories.find(c => c.id === product.category_id)?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted align-middle">
                          {product.has_variant ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-end align-middle">
                        <Button
                          variant="link"
                          className="text-primary p-0 me-3"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                   {products.length === 0 && (
                      <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">No products found.</td>
                      </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Product' : 'Add Product'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      {...register('category_id', { required: true })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      {...register('product_name', { required: true })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Has Variants?"
                  {...register('has_variant')}
                  id="has_variant_check"
                />
              </Form.Group>

              {hasVariant && (
                <Card className="mb-3 bg-light border-0">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Variant Name</Form.Label>
                          <Form.Control
                            type="text"
                            {...register('variant_name')}
                            placeholder="e.g. Size, Color"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Variant Values</Form.Label>
                          <Form.Control
                            type="text"
                            {...register('variant_values')}
                            placeholder="e.g. S, M, L or Red, Blue"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <div className="mb-3">
                <Form.Label>Specifications</Form.Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="d-flex gap-2 mb-2">
                    <Form.Control
                      {...register(`specifications.${index}.key`)}
                      placeholder="Key (e.g. Material)"
                    />
                    <Form.Control
                      {...register(`specifications.${index}.value`)}
                      placeholder="Value (e.g. Cotton)"
                    />
                    <Button variant="outline-danger" onClick={() => remove(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="link"
                  className="p-0 text-decoration-none d-flex align-items-center mt-2"
                  onClick={() => append({ key: '', value: '' })}
                >
                  <Plus size={16} className="me-1" /> Add Specification
                </Button>
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Main Image</Form.Label>
                    <Form.Control
                      type="file"
                      {...register('main_image')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Additional Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      {...register('images')}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};

export default Products;
