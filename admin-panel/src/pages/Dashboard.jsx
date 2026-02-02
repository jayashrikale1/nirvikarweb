import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Container fluid className="p-4 d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" variant="primary" />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="p-4">
        <h2 className="mb-4">Dashboard</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Total Products</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">{stats.totalProducts}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Total Categories</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">{stats.totalCategories}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Orders</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">{stats.totalOrders}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        <div className="mt-5">
          <h3 className="mb-4">Recent Activity</h3>
          <Card className="shadow-sm text-center p-5 text-muted">
             <Card.Body>
               No recent activity found.
             </Card.Body>
          </Card>
        </div>
      </Container>
    </Layout>
  );
};

export default Dashboard;
