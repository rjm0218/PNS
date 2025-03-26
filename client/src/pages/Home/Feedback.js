import { useState } from "react";
import { Container, Button, Stack, FloatingLabel, Form } from "react-bootstrap";

import { api } from "../../axios_config.js";
import { useThemeContext } from "../../context/theme.context";

import "./home.css";

function Feedback(props) {
  const { viewSize } = useThemeContext();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, val } = e.target;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    setErrors({});
    e.preventDefault();
    if (formData.checkValidity() === false) {
      const errors = {};
      if (!formData.name) errors.name = "Name is required";
      if (!formData.email) errors.email = "Email is required";
      if (!/\S+@\S+\.\S+/.test(formData.email))
        errors.email = "Email address is invalid";
      if (!formData.message) errors.email = "A message is required";
      setErrors(errors);
      return;
    }
    setValidated(true);

    const feedback = formData;
    try {
      // Send feedback data to the backend
      await api.post("/utils/feedback", feedback);
      setFormData({});
      props.setFeedbackMode(false); // Set submitFeedback state to true
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <Container fluid="sm" className="feed-container">
      <h6>Please let me know how I can improve things.</h6>
      <Form
        as={Stack}
        gap={2}
        noValidate
        validated={validated}
        className="mb-3 feed-form"
      >
        <FloatingLabel label="Name" className="mb-3">
          <Form.Control
            required
            type="text"
            placeholder=""
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </FloatingLabel>
        <FloatingLabel label="Email" className="mb-3">
          <Form.Control
            required
            type="email"
            placeholder=""
            minLength={6}
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </FloatingLabel>
        <Form.Label className="feed-label">Message</Form.Label>
        <Form.Control
          required
          as="textarea"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          isInvalid={!!errors.message}
        />
        <Form.Control.Feedback type="invalid">
          {errors.message}
        </Form.Control.Feedback>
        <Button
          type="submit"
          onClick={handleSubmit}
          size={viewSize}
          className="submit-button"
        >
          Login
        </Button>
      </Form>
      <Button
        size={viewSize}
        onClick={() => props.setFeedbackMode(false)}
        className="exit-button"
      >
        Back to Login
      </Button>
    </Container>
  );
}

export default Feedback;
