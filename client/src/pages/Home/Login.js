import { useState } from "react";
import { Container, Button, Stack, Form, FloatingLabel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { api } from "../../axios_config.js";
import { useLoginContext } from "../../context/login.context";
import { useThemeContext } from "../../context/theme.context";

import "./home.css";

function Login() {
  const navigate = useNavigate();
  const { viewSize } = useThemeContext();
  const { setLoggedIn, setUser } = useLoginContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    pass: "",
  });

  const handleChange = (e) => {
    setErrors({});
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const errors = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.pass) errors.pass = "Password is required";
    setErrors(errors);
    setValidated(true);
    if (Object.keys(errors).length !== 0) {
      return;
    }

    try {
      const response = await api.post(
        "/auth/login",
        { username: formData.username, password: formData.pass },
        { withCredentials: "same-origin" }
      );
      setFormData({});
      setUser(response.data.data);
      setLoggedIn(true);
      navigate("/dashboard"); // Navigate to the dashboard after login
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : "No response"
      );
    }
  };

  return (
    <Container fluid="sm" className="login-container">
      <h2>Welcome to Synner Sanctuary</h2>
      <h6>Log in to access your accounts and see events.</h6>
      <Form
        as={Stack}
        gap={2}
        noValidate
        validated={validated}
        className="mb-3 login-form"
      >
        <FloatingLabel label="Username" className="mb-3">
          <Form.Control
            required
            type="text"
            name="username"
            placeholder=""
            value={formData.username}
            onChange={handleChange}
            isInvalid={!!errors.username}
          />
          <Form.Control.Feedback type="invalid">
            {errors.username}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel label="Password" className="mb-3">
          <Form.Control
            required
            type="password"
            name="pass"
            placeholder=""
            value={formData.pass}
            onChange={handleChange}
            isInvalid={!!errors.pass}
          />
          <Form.Control.Feedback type="invalid">
            {errors.pass}
          </Form.Control.Feedback>
        </FloatingLabel>
        <Button
          type="submit"
          onClick={handleLogin}
          size={viewSize}
          className="login-button"
        >
          Login
        </Button>
      </Form>
    </Container>
  );
}

export default Login;
