import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useLocation } from 'react-router-dom';
import Dropdown from 'react-multilevel-dropdown';
import { Navbar, Nav, NavDropdown} from 'react-bootstrap';
import menu from './data/menu.json';
import { useLoginContext } from '../context/login.context';

import './css/components.css';

function NavMenu() {
	
	const navigate = useNavigate();
	const location = useLocation();
	const [activePage, setActivePage] = useState('');
	const {handleLogout} = useLoginContext();
	
	const isBigScreen = useMediaQuery({ query: '(min-width: 750px)' })
	const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })
	
	useEffect(() => {
		const { pathname } = location;
		setActivePage(pathname.substring(1)); // Remove the leading '/'
		console.log('Active Page:', pathname.substring(1)); // Log the activePage state value
    }, [location]);
	
	const handleNav = (eventKey, event) => {
		if (eventKey === 'logout') {
			handleLogout(event);
			navigate('/');
		} else {
			console.log("Navigating to:", eventKey);
			if (eventKey !== '') {
			  navigate(`/${eventKey}`);
			} else {
			  navigate('/dashboard');
			}
		}
	}
	
	return (
	
	<div className="navbarheader">
		{isTabletOrMobile &&
		<Dropdown title='Menu' position="right">
			{activePage !== 'dashboard' && (
				<Dropdown.Item position="right" onClick={() => handleNav('')}>Dashboard</Dropdown.Item>
			)}
			{menu.map((drop, index) => (
				<Dropdown.Item key={index} position="right">{drop.label}
					{drop.children !== null && (
						<Dropdown.Submenu key={index} position="right">
							{drop.children.map((sub, index2) => (
								<Dropdown.Item key={index2} position="right" onClick={() => handleNav(sub.path)}>{sub.label}</Dropdown.Item>
							))}
						</Dropdown.Submenu>
					)}
				</Dropdown.Item>
			))}
			<Dropdown.Item position="right" onClick={handleLogout}>Logout</Dropdown.Item>
		</Dropdown>
		}
		{isBigScreen && 
			<Navbar className="bg-body-tertiary">
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto" onSelect={handleNav}>
							<Nav.Link eventKey=''>Dashboard</Nav.Link>
							
							{menu.map((drop, index) => (
								<NavDropdown key={drop.label} title={drop.label} id="basic-nav-dropdown">
									{drop.children !== null && drop.children.map((sub, index2) => (
										<NavDropdown.Item key={sub.label} eventKey={sub.path}>{sub.label}</NavDropdown.Item>
									))}
								</NavDropdown>
							))}
							<Nav.Link eventKey='logout'>Logout</Nav.Link>
						</Nav>
					</Navbar.Collapse>
			</Navbar>
		}
	</div>
	);
}

export default NavMenu;