import React, { useState, useEffect, useCallback } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';

import SanctuaryOverview from './SanctuaryOverview';
import PlanAhead from './PlanAhead';

import './sanctuary.css';

function Sanctuary() {

	const { user } = useLoginContext();
	const {currentAccount} = useAccountContext();
	const [buildings, setBuildings] = useState([]);
	const [currentTab, setCurrentTab] = useState(localStorage.getItem('activeSancTab') || 'overview');

	
	const getUserData = useCallback(async () => {
		
		const accName = currentAccount.name;

		try {
			const response = await api.post('/sanctuary', { user, accName });
			if (response != null) {
				let data = response.data.account;
				if (data != null) {
					setBuildings(data.buildings);
				}
			}
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
		}

	}, [currentAccount, user]);
	
	useEffect(() => {
		getUserData();
	}, []);
	
	
	function handleTabChange(tab) {
		setCurrentTab(tab);
		localStorage.setItem('activeSancTab', tab);
	}
	

	return (
			
			<Container fluid className="sanctuary-container">
				<NavMenu />
				<AccountSelection />
				<Tabs 
					defaultActiveKey={currentTab}
					className="mb-3"
					onSelect={(evKey) => handleTabChange(evKey)}
				>
					<Tab eventKey="overview" title="Sanctuary Overview">
						{currentTab === 'overview' &&
							<SanctuaryOverview buildings={buildings} setBuildings={setBuildings} />
						}
					</Tab>
					<Tab eventKey="plan" title="Plan Ahead">
						{currentTab === 'plan' && buildings.length > 0 &&
							<PlanAhead buildings={buildings} />
						}
					</Tab>
					
				</Tabs>
			</Container>
	);
}

export default Sanctuary;