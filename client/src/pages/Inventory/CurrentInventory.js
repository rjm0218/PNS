import apiRoutes from '../../utils/apiRoutes';
import { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Stack, InputGroup, Form, ButtonGroup, Dropdown } from 'react-bootstrap';
import { createWorker, PSM } from 'tesseract.js';
import 'jimp';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';
import { useThemeContext } from '../../context/theme.context';

import './inventory.css';


function CurrentInventory({items, setItems}) {
	
	const { viewSize } = useThemeContext();
	const { user } = useLoginContext();
	const { currentAccount } = useAccountContext();
	const [itemName, setItemName] = useState('');
	const [quantity, setQuantity] = useState('');
	const [box, setBox] = useState('False');
	const [multiplier, setMultiplier] = useState('');

	useEffect(() => {
		let items = currentAccount.inventory;
		setItems(items);
	}, [currentAccount]);
	
	const handleAddItem = () => {

		const newItem = {
			_id: Math.random().toString(36).substr(2, 9),
				name: itemName,
				quantity,
				box,
				multiplier,
			};

		setItems([...items, newItem]);
		setItemName('');
		setQuantity('');
		setBox('');
		setMultiplier('');

		const accName = currentAccount.name;

		// Send a POST request to your backend server to save the item to the database
		api.post(apiRoutes.inventory.add, { user, accName, newItem }).then(response => {
			console.log('Item added to grocery list:', response.data);
			// Optionally, update state or trigger any other actions
		})
		.catch(error => {
			console.error('Error adding item to grocery list:', error);
			// Handle error appropriately
		});

	};

	const handleDeleteItem = (id) => {
		const updatedItems = items.filter((item) => item._id !== id);
		setItems(updatedItems);

		const itemToRemove = items.filter((item) => item._id === id);
		if (itemToRemove.length > 1) {
			console.log("Found more than 1 item with id = " + id);
			return;
		}
		
		let itrm = itemToRemove[0];
		const accName = currentAccount.name;

		// Send a POST request to your backend server to save the item to the database
		api.post(apiRoutes.inventory.remove, { user, accName, itrm })
		.then(response => {
			console.log('Item removed from inventory list:', response.data);
		// Optionally, update state or trigger any other actions
		})
		.catch(error => {
			console.error('Error removing item from inventory list:', error);
		// Handle error appropriately
		});


	};
  
   const updateItem = (index, value, param) => {
    const updatedItems = [...items];
	let name = updatedItems[index].name;
	switch (param) {
		case 'name':
			updatedItems[index].name = value;
			break;
		case 'quantity':
			updatedItems[index].quantity = value;
			break;
		default:
			break;
	}
    updateDB(updatedItems[index], name)
    setItems(updatedItems);
  };
  
	const updateDB = (item, name) => {
		const accName = currentAccount.name;

		// Send a POST request to your backend server to save the item to the database
		api.post(apiRoutes.inventory.update, { user, accName, item, name})
		  .then(response => {
			console.log('Item added to inventory list:', response.data);
			// Optionally, update state or trigger any other actions
		  })
		  .catch(error => {
			console.error('Error adding item to inventory list:', error);
			// Handle error appropriately
		  });
	}
	

	return (
		<div className="inventory-list">
		<h3>Add Single Item</h3>
			<Row>
				<Col>
					<InputGroup size={viewSize} className="mb-3">
						<InputGroup.Text className="input-text" id="input-name">Name</InputGroup.Text>
						<Form.Control
						  placeholder="Item name"
						  aria-describedby="input-name"
						  onChange={(e) => setItemName(e.target.value)}
						/>
					</InputGroup>
				</Col>
				<Col>
					<InputGroup size={viewSize} className="mb-3">
						<InputGroup.Text className="input-text" id="input-quantity">Name</InputGroup.Text>
						<Form.Control
						  placeholder="Item quantity"
						  aria-describedby="input-quantity"
						  onChange={(e) => setQuantity(e.target.value)}
						/>
					</InputGroup>
				</Col>
				<Col md="auto">
					<InputGroup size={viewSize} className="mb-3">
						<InputGroup.Text className="input-text" id="basic-addon1">Box</InputGroup.Text>
						<Dropdown as={ButtonGroup}>
							<Button variant ="light">{box}</Button>
							<Dropdown.Toggle split variant="light" />
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => setBox('True')}>True</Dropdown.Item>
								<Dropdown.Item onClick={() => setBox('False')}>False</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</InputGroup>
				</Col>
				<Col md="auto">
				  {box === "True" && (
						<InputGroup size={viewSize} className="mb-3">
							<InputGroup.Text className="input-text" id="basic-addon1">Multiplier</InputGroup.Text>
							<Form.Control
							  placeholder="Box multiplier"
							  aria-describedby="basic-addon1"
							  onChange={(e) => setMultiplier(e.target.value)}
							/>
						</InputGroup>
					)}
				</Col>
				<Col>
					<Button size={viewSize} variant='secondary' className="inventory-button" onClick={handleAddItem}>Add Item</Button>
				</Col>
			</Row>
			<h3>Current Inventory</h3>
			{items.map((item, index) => (
				<Container key={index} fluid>
					<Stack direction="horizontal" gap={3}>
						<InputGroup size={viewSize} className="mb-3">
							<InputGroup.Text id="basic-addon1">Item</InputGroup.Text>
							<Form.Control
								placeholder={item.name}
								aria-describedby="basic-addon1"
								onChange={(e) => updateItem(index,e.target.value,"name")}
							/>
						</InputGroup>
						<InputGroup size={viewSize} className="mb-3">
							<InputGroup.Text className="ms-auto" id="basic-addon1">Quantity</InputGroup.Text>
							<Form.Control
							  placeholder={item.quantity}
							  aria-describedby="basic-addon1"
							  onChange={(e) => updateItem(index,e.target.value,"quantity")}
							/>
						</InputGroup>
						<Button size={viewSize} className="mb-3" variant="primary" onClick={() => updateItem(index,Number.parseInt(item.quantity)+1,"quantity")}>+</Button>
						<Button size={viewSize} className="mb-3" variant="primary" onClick={() => updateItem(index,Number.parseInt(item.quantity)-1,"quantity")}>-</Button>
						<Button size={viewSize} className="mb-3" variant="danger" onClick={() => handleDeleteItem(index)}>Delete</Button>
					</Stack>
				</Container>
			))}
		</div>
	);
}



export default CurrentInventory;
