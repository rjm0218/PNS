import { useState } from 'react';
import { Container, Button, Stack, FloatingLabel, Form } from 'react-bootstrap';

import {api} from '../../axios_config.js';

import './home.css';

function Register(props) {
	
	const [validated, setValidated] = useState(false);
	const [errors, setErrors] = useState({});
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		pass: "",
		confirmpass: "",
	});
	
	
	const handleChange = (e) => {
		const {name, val} = e.target;
		setFormData({...formData,[name]:val});
	};


	const checkPasswordStrength = (password) => {
	  const match = [/[A-Z]/, /[a-z]/, /[0-9]/, /[`~!@#$%^&*()_+[\];',.<>?/]/];
	  for (let i = 0; i < match.length; i++) {
		if (password.match(match[i]) == null) {
		  return false;
		}
	  }

	  return true;
	}
	
	const handleRegistration = async (e) => {
		setErrors({});
		e.preventDefault();
		if (formData.checkValidity() === false) {
			const errors = {};
			if (!formData.username) errors.username = 'Username is required';
			if (!formData.email) errors.email = 'Email is required';
			if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email address is invalid';
			if (!formData.pass) errors.pass = 'Password is required';
			if (!checkPasswordStrength(formData.pass)) errors.pass = 
			`Passwords must have: <br></br>
							-At least 6 characters
							-One lower case letter <br></br>
							-One upper case letter <br></br>
							-One number <br></br>
							-One symbol.
			`;
			if (formData.pass !== formData.confirmpass) errors.confirmpass = 'Passwords do not match';
			setErrors(errors);
			return;
		}
		setValidated(true)

		try {
			await api.post('/register', { username: formData.username, email: formData.email, password: formData.pass });
			setFormData({});
			props.setIsRegisterMode(false); // Switch back to login mode after successful registration
		} catch (error) {
			console.error('Registration failed:', error.response ? error.response.data : 'No response');
		}
	};


	return (
		<Container fluid className="register-container">
			<h2>Register</h2>
			<Form as={Stack} gap={1} noValidate validated={validated} className="mb-3 register-form">
				<FloatingLabel label="Username" className="mb-3">
					<Form.Control
						required
						type="text"
						placeholder=""
						value={formData.username}
						onChange={handleChange}
						isInvalid={!!errors.username}
					/>
					<Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
				</FloatingLabel>
				<FloatingLabel label="Email" className="mb-3">
					<Form.Control
						required
						type="email"
						placeholder=""
						value={formData.email}
						onChange={handleChange}
						isInvalid={!!errors.email}
					/>
					<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
				</FloatingLabel>
				<FloatingLabel label="Password" className="mb-3">
					<Form.Control
						required
						type="password"
						placeholder=""
						minLength={6}
						value={formData.pass}
						onChange={handleChange}
						isInvalid={!!errors.pass}
					/>
					<Form.Control.Feedback type="invalid">{errors.pass}</Form.Control.Feedback>
				</FloatingLabel>
				<FloatingLabel label="Confirm Password" className="mb-3">
					<Form.Control
						required
						type="password"
						placeholder=""
						minLength={6}
						value={formData.confimPass}
						onChange={handleChange}
						pattern={formData.pass}
						isInvalid={!!errors.confirmpass}
					/>
					<Form.Control.Feedback type="invalid">{errors.confirmpass}</Form.Control.Feedback>
				</FloatingLabel>
				<Button type="submit" onClick={handleRegistration} className="register-button">Register</Button>
			</Form>
			<Button onClick={() => props.setIsRegisterMode(false)} className="exit-button">Back to Login</Button>
		</Container>
	);
} 

export default Register;
