import React, { useState, useEffect, useCallback } from 'react';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import BuildingField from '../../components/BuildingField';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';

import './sanctuary.css';

function SanctuaryOverview({buildings, setBuildings}) {

	const { user } = useLoginContext();
	const { accounts, currentAccount} = useAccountContext();

	
	const updateBuilding = (index, value) => {
		const updatedHQ = [...buildings];
		let name = updatedHQ[index].name;
		updatedHQ[index].level = value;
		
		updateDB(updatedHQ[index], name);
		setBuildings(updatedHQ);
  };

  
  	const updateDB = async (building, name) => {
		const accName = currentAccount.name;
		
		try {
			const response = await api.post('/updateSanctuary', { user, accName, building});
			if (response.status === 200) {
				console.error('Updated inventory successfully.');
			} else {
				console.error('Error:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching user data:', error.message);
		}
	};
	



	return (
			<div className="sanctuary-content">
				<h3>{currentAccount.name + "'s Sanctuary"}</h3>
				<div className="building-list">
					{buildings.map((build, index) => (
						<BuildingField key={index} index={index} building={build} update={updateBuilding} />
					))}
				</div>
			</div>
	);
}

export default SanctuaryOverview;