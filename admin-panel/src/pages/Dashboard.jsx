import React from 'react';
import Layout from '../components/Layout';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <Layout>
      <Container fluid className="p-4">
        <h2 className="mb-4">Dashboard</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Total Products</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">0</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Total Categories</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">0</Card.Title>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">Orders</Card.Subtitle>
                <Card.Title className="display-6 fw-bold">0</Card.Title>
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
