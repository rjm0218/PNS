import { useState, useEffect } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { createWorker, PSM } from 'tesseract.js';
import 'jimp';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';
import { useThemeContext } from '../../context/theme.context';

import CurrentInventory from './CurrentInventory';
import ItemFromScreenshot from './ItemFromScreenshot';


import './inventory.css';


function Inventory() {
	
	const { viewSize } = useThemeContext();
	const [items, setItems] = useState([]);
	const [currentTab, setCurrentTab] = useState(localStorage.getItem('activeInvTab') || 'current');
	
	function handleTabChange(tab) {
		setCurrentTab(tab);
		localStorage.setItem('activeInvTab', tab);
	}

	return (
		<Container fluid className="inventory-container">
			<NavMenu />
			<AccountSelection />
			<Tabs 
				defaultActiveKey={currentTab}
				className="mb-3"
				onSelect={(evKey) => handleTabChange(evKey)}
			>
				<Tab eventKey="current" title="Current Inventory">
					{currentTab === 'current' &&
						<CurrentInventory items={items} setItems={setItems} />
					}
				</Tab>
				<Tab eventKey="screen" title="Use SS">
					{currentTab === 'screen' &&
						<ItemFromScreenshot items={items} setItems={setItems} />
					}
				</Tab>
				
			</Tabs>
		</Container>
	);
}



export default Inventory;
