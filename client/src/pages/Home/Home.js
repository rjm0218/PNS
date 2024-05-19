import { useState, useEffect, useContext } from 'react';
import { Container, Button, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import Table from '../../components/Table';
import { AccountProvider, useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';

import PNSHeader from './PNS_header.jpg';
import zombie from './zombie.gif';

import './home.css';

var warning_hidden = true;

function Home() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const navigate = useNavigate();
	const [registerUsername, setRegisterUsername] = useState('');
	const [registerEmail, setRegisterEmail] = useState('');
	const [registerPassword, setRegisterPassword] = useState('');
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [submitFeedback, setFeedbackMode] = useState(true);

	const { setLoggedIn, setUser } = useLoginContext();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const feedback = { name, email, message };
		try {
			// Send feedback data to the backend
			await api.post('/feedback', feedback);
			setName('');
			setEmail('');
			setMessage('');
			//alert('Feedback submitted successfully');

			//setFeedbackMode(true); // Set submitFeedback state to true
		} catch (error) {
			console.error('Error submitting feedback:', error);
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post('/login', { username, password }, {withCredentials: 'same-origin'});
			setUser(response.data.name);
			setLoggedIn(true);
			navigate('/dashboard'); // Navigate to the dashboard after login
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
			setMessage('Login failed: ' + (error.response ? error.response.data : 'No response')); // Set error message
		}
	};

	const handleRegistration = async (e) => {
		e.preventDefault();
		let warn = document.getElementsByClassName('passwordHint');
		if (warn !== null && warn[0].hidden === false) {
			warn[0].hidden = true;
			warning_hidden = true;
		}

		if (!checkPasswordStrength(registerPassword)) {
			warn[0].style.color = "red";
			warn[0].hidden = false;
			warning_hidden = false;
			return;
		}


		try {
			await api.post('/register', { username: registerUsername, email: registerEmail, password: registerPassword });
			setIsRegisterMode(false); // Switch back to login mode after successful registration
		} catch (error) {
			console.error('Registration failed:', error.response ? error.response.data : 'No response');
			warn[0].style.color = "red";
			warn[0].hidden = false;
			warning_hidden = false;
			warn[0].innerText = 'Registration failed: ' + (error.response ? error.response.data : 'No response');
		}
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


	return (
		<div className="main-container">
			<img src={zombie} alt='PNS Logo' />
			{!isRegisterMode && (
			  <section className="login-section" id="login">
				<h2>Welcome to Synner Sanctuary</h2>
				<h6>Log in to access your accounts and see events.</h6>
				<form onSubmit={handleLogin} className="login-form">
				  <div className="form-group">
					<input
					  type="text"
					  id="username"
					  value={username}
					  onChange={(e) => setUsername(e.target.value)}
					  className="input-field"
					  placeholder="Username"
					  required
					/>
				  </div>
				  <div className="form-group">
					<input
					  type="password"
					  id="password"
					  value={password}
					  onChange={(e) => setPassword(e.target.value)}
					  className="input-field"
					  placeholder="Password"
					  required
					/>
				  </div>
				  <button type="submit" className="login-button">
					Login
				  </button>
				</form>
				<div className="register-text">
				  First time user?
				  <button type="button" onClick={() => setIsRegisterMode(true)} className="register-button">
					Register
				  </button>
				</div>
			  </section>
			)}
			{isRegisterMode && (
			  <section className="register-section" id="register">
				<h2>Register</h2>
				<form onSubmit={handleRegistration} className="register-form">
				  <div className="form-group">
					<input
					  type="text"
					  id="register-username"
					  value={registerUsername}
					  onChange={(e) => setRegisterUsername(e.target.value)}
					  className="input-field"
					  placeholder="Username"
					  required
					/>
				  </div>
				  <div className="form-group">
					<input
					  type="email"
					  id="register-email"
					  value={registerEmail}
					  onChange={(e) => setRegisterEmail(e.target.value)}
					  className="input-field"
					  placeholder="Email"
					  required
					/>
				  </div>
				  <div className="form-group">
					<input
					  type="password"
					  id="register-password"
					  value={registerPassword}
					  onChange={(e) => setRegisterPassword(e.target.value)}
					  className="input-field"
					  placeholder="Password"
					  required
					/>
				  </div>
				  <p className="passwordHint" hidden={warning_hidden}>
					Passwords must have: <br></br>
					-One lower case letter <br></br>
					-One upper case letter <br></br>
					-One number <br></br>
					-One symbol.
				  </p>

				  <button type="submit" className="register-button">
					Register
				  </button>
				</form>
			  </section>
			)}
			
			{!submitFeedback ? (
			  <div className="feedback" id="feedback" onSubmit={handleSubmit}>
				<h2>We value your feedback</h2>
				<form className="feedback-form" onSubmit={() => setFeedbackMode(true)}>
				  <div className="form-group">
					<input
					  type="text"
					  id="name"
					  value={name}
					  onChange={(e) => setName(e.target.value)}
					  className="input-field"
					  placeholder="Your Name"
					/>
				  </div>
				  <div className="form-group">
					<input
					  type="email"
					  id="email"
					  value={email}
					  onChange={(e) => setEmail(e.target.value)}
					  className="input-field"
					  placeholder="Your Email"
					/>
				  </div>
				  <div className="form-group">
					<textarea
					  id="message"
					  value={message}
					  onChange={(e) => setMessage(e.target.value)}
					  className="input-field"
					  placeholder="Your Message"
					  rows={4}
					/>
				  </div>
				  <button type="submit" className="submit-button">
					Submit
				  </button>
				</form>
			  </div>
			) : ( null
			)}
		</div>
	);
} 

export default Home;
