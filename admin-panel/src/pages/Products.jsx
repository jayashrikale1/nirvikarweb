import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Card, Table, Button, Modal, Form, Row, Col, Image, Pagination } from 'react-bootstrap';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, watch, control } = useForm({
    defaultValues: {
      specifications: [{ key: '', value: '' }],
      gst_applicable: false,
      home_delivery: true,
      status: true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications"
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (query = '', page = 1) => {
    try {
      const response = await api.get('/products', { params: { search: query, page, limit: 10 } });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery, 1);
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts(searchQuery, currentPage);
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
      brand: product.brand,
      short_description: product.short_description,
      full_description: product.full_description,
      uses: product.uses,
      material: product.material,
      country_of_origin: product.country_of_origin,
      mrp_price: product.mrp_price,
      selling_price: product.selling_price,
      doctor_price: product.doctor_price,
      gst_applicable: product.gst_applicable,
      home_delivery: product.home_delivery,
      status: product.status,
      specifications: specs
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('category_id', data.category_id);
    formData.append('product_name', data.product_name);
    formData.append('brand', data.brand || '');
    formData.append('short_description', data.short_description || '');
    formData.append('full_description', data.full_description || '');
    formData.append('uses', data.uses || '');
    formData.append('material', data.material || '');
    formData.append('country_of_origin', data.country_of_origin || '');
    formData.append('mrp_price', data.mrp_price || 0);
    formData.append('selling_price', data.selling_price || 0);
    formData.append('doctor_price', data.doctor_price || 0);
    formData.append('gst_applicable', data.gst_applicable);
    formData.append('home_delivery', data.home_delivery);
    formData.append('status', data.status);
    
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
      fetchProducts(searchQuery, currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset({ 
      specifications: [{ key: '', value: '' }],
      gst_applicable: false,
      home_delivery: true,
      status: true
    });
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
                reset({ 
                  specifications: [{ key: '', value: '' }],
                  gst_applicable: false,
                  home_delivery: true,
                  status: true
                });
                setShowModal(true);
            }}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={16} />
            Add Product
          </Button>
        </div>

        <Form onSubmit={handleSearch} className="mb-4">
            <Row>
                <Col md={8} lg={6}>
                    <div className="d-flex gap-2">
                        <Form.Control
                            type="text"
                            placeholder="Search by name, brand..."
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
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Price</th>
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
                          {categories.find(c => c.id === product.category_id)?.category_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted align-middle">{product.brand || '-'}</td>
                      <td className="px-4 py-3 text-muted align-middle">
                          {product.selling_price ? `₹${product.selling_price}` : '-'}
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
                          <td colSpan="6" className="text-center py-4 text-muted">No products found.</td>
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
                    <Pagination.First onClick={() => fetchProducts(searchQuery, 1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => fetchProducts(searchQuery, currentPage - 1)} disabled={currentPage === 1} />
                    
                    {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item 
                            key={idx + 1} 
                            active={idx + 1 === currentPage}
                            onClick={() => fetchProducts(searchQuery, idx + 1)}
                        >
                            {idx + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next onClick={() => fetchProducts(searchQuery, currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => fetchProducts(searchQuery, totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered scrollable backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Product' : 'Add Product'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select {...register('category_id', { required: true })}>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control {...register('product_name', { required: true })} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control {...register('brand')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Material</Form.Label>
                        <Form.Control {...register('material')} />
                    </Form.Group>
                </Col>
              </Row>

              <Row>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>Country of Origin</Form.Label>
                          <Form.Control {...register('country_of_origin')} />
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>MRP Price</Form.Label>
                          <Form.Control type="number" step="0.01" {...register('mrp_price')} />
                      </Form.Group>
                  </Col>
              </Row>

              <Row>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>Selling Price</Form.Label>
                          <Form.Control type="number" step="0.01" {...register('selling_price')} />
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label>Doctor Price</Form.Label>
                          <Form.Control type="number" step="0.01" {...register('doctor_price')} />
                      </Form.Group>
                  </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Short Description</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('short_description')} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Full Description</Form.Label>
                <Form.Control as="textarea" rows={3} {...register('full_description')} />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Uses</Form.Label>
                  <Form.Control as="textarea" rows={2} {...register('uses')} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Specifications</Form.Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="d-flex gap-2 mb-2">
                    <Form.Control placeholder="Key" {...register(`specifications.${index}.key`)} />
                    <Form.Control placeholder="Value" {...register(`specifications.${index}.value`)} />
                    <Button variant="outline-danger" onClick={() => remove(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={() => append({ key: '', value: '' })}>
                  <Plus size={14} className="me-1" /> Add Specification
                </Button>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Main Image</Form.Label>
                <Form.Control type="file" {...register('main_image')} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Images</Form.Label>
                <Form.Control type="file" multiple {...register('images')} />
              </Form.Group>

              <Row>
                  <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="GST Applicable" {...register('gst_applicable')} />
                      </Form.Group>
                  </Col>
                  <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Home Delivery" {...register('home_delivery')} />
                      </Form.Group>
                  </Col>
                  <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Active Status" {...register('status')} />
                      </Form.Group>
                  </Col>
              </Row>

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

export default Products;
