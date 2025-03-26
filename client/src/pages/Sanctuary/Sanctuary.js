import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

	const memoizedBuildings = useMemo(() => buildings, [buildings]);

	const getUserData = useCallback(async () => {
		
		const accName = currentAccount.name;

		try {
			let response = await api.post('/accounts/sanctuary', { user, accName });
			if (response != null) {
				let account = response.data.data;
				if (account != null) {
					setBuildings(account.buildings);
				}
			}
		} catch (error) {
			console.error('Login failed:', error.response ? error.response.data : 'No response');
		}

	}, [currentAccount, user]);
	
	useEffect(() => {
		getUserData();
	}, [currentAccount, user, getUserData]);
	
	
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
							<SanctuaryOverview buildings={memoizedBuildings} setBuildings={setBuildings} />
						}
					</Tab>
					<Tab eventKey="plan" title="Plan Ahead">
						{currentTab === 'plan' && buildings.length > 0 &&
							<PlanAhead buildings={memoizedBuildings} />
						}
					</Tab>
					
				</Tabs>
			</Container>
	);
}

export default Sanctuary;
