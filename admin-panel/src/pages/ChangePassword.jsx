import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import Layout from '../components/Layout';
import { Lock, KeyRound, Save } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords don't match");
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Layout>
      <Container fluid className="p-4">
        
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <KeyRound size={32} className="text-primary" />
                  </div>
                  <h4 className="mb-1">Change Password</h4>
                  <p className="text-muted">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <Lock size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border-start-0 ps-0"
                        placeholder="Enter current password"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <KeyRound size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-start-0 ps-0"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm New Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <KeyRound size={18} className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-start-0 ps-0"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button disabled={loading} variant="primary" type="submit" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                    <Save size={18} />
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default ChangePassword;
