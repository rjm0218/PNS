import { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Stack, InputGroup, Form, ButtonGroup, Dropdown, ProgressBar } from 'react-bootstrap';
import { createWorker, PSM } from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';
import { useThemeContext } from '../../context/theme.context';

import {preProcessImage, findItems} from './ProcessImage';

import './inventory.css';


function ItemFromScreenshot({items, setItems}) {
	
	const { viewSize } = useThemeContext();
	const { user } = useLoginContext();
	const { currentAccount } = useAccountContext();
	const [itemName, setItemName] = useState('');
	const [quantity, setQuantity] = useState('');
	const [box, setBox] = useState('False');
	const [multiplier, setMultiplier] = useState('');
	const [screenshots, setFiles] = useState([]);
	const [procImage, setProcImage] = useState('');
	const [ssItemsFound, setSSItemsFound] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] =  useState('');
	
	useEffect(() => {
    async function loadModel() {
      // Load the model
      const model = await tf.loadLayersModel('./ocr_model.tflite');
      console.log('Model loaded.');

      // Here you can now use the model to make predictions
      // Example: model.predict(someInput);
    }

    loadModel();
  }, []);
	
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
		api.post('/addToInventory', { user, accName, newItem }).then(response => {
			console.log('Item added to grocery list:', response.data);
			// Optionally, update state or trigger any other actions
		})
		.catch(error => {
			console.error('Error adding item to grocery list:', error);
			// Handle error appropriately
		});

	};
	
	const handleOCR = async () => {
		if (screenshots.length !== 0) {
			
			const worker = await createWorker('eng', 1, {
			  logger: m => {
				  if (m.status === 'recognizing text') {
					  setProgress(m.progress*100);
				  }
			  }
			});
			
			
			await worker.setParameters({
				tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ: *✰★',
				tessedit_pageseg_mode: PSM.AUTO_OSD,
				user_defined_dpi: 300
			});
			
			setSSItemsFound([]);
			setIsProcessing(true);
			startOCR(worker);
		}
	}
	
	const startOCR = async (worker) => {
		let tempList = [];
		for (let file of screenshots) {
			let image = await preProcessImage(file);
			await worker.recognize(image).then(({data: {lines}}) => {
				let found = findItems(lines);
				if (found) {
					Array.prototype.push.apply(tempList, found)
				}
			})
			.catch(err => console.error(err))
			.finally(() => setProgress(0));

		}
		setSSItemsFound([...ssItemsFound, ...tempList]);
		//await worker.terminate();
		setIsProcessing(false);
	};


	return (
		<div className="inventory-list">
			<h3>Add Items from Screenshots</h3>
			<Row>
				<InputGroup size={viewSize} className="mb-3 screenshots">
					<Form.Control  type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))}/>
					<Button variant='secondary' className="inventory-button" onClick={() => handleOCR()}>Get Items</Button>
				</InputGroup>
				{isProcessing && <ProgressBar striped variant="success" now={progress} /> }
			</Row>
			{!isProcessing && ssItemsFound.length > 0 && ssItemsFound.map((item, index) => (
				<Row key={index}>
					<Col xs={8}>
						<InputGroup key={item.name} size={viewSize} className="mb-3">
							<InputGroup.Text key={index+'name'} className="item-found">Item</InputGroup.Text>
							<Form.Control
								key={index}
								placeholder={item.name}
								aria-describedby="basic-addon1"
								className="item-found  item-name"
							/>
						</InputGroup>
					</Col>
					<Col xs={4}>
						<InputGroup key={item.quantity} size={viewSize} className="mb-3">
							<InputGroup.Text key={index+"quant"} className="item-found">Quantity</InputGroup.Text>
							<Form.Control
							key={index+'value'}
							  placeholder={item.quantity}
							  aria-describedby="basic-addon1"
							  className="item-found  item-quantity"
							/>
						</InputGroup>
					</Col>
				</Row>
			))}

		</div>
	);
}



export default ItemFromScreenshot;
