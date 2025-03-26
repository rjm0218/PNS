import apiRoutes from '../../utils/apiRoutes';
import React from 'react';

import {api} from '../../axios_config.js';
import BuildingField from '../../components/BuildingField';
import { useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';

import './sanctuary.css';

function SanctuaryOverview({buildings, setBuildings}) {

	const { user } = useLoginContext();
	const {currentAccount} = useAccountContext();

    const updateBuilding = (index, value) => {
		setBuildings((prevBuildings) => {
		const updatedBuildings = prevBuildings.map((build, i) => {
			if (i === index) {
				const updatedBuild = { ...build, level: value };
                console.log('Building to update:', updatedBuild); // Add this line
                return updatedBuild;
			}
			return build;
			});
		updateDB(updatedBuildings[index]);
		return updatedBuildings;
		});
	
	};
	

  
  	const updateDB = async (building) => {
		const accName = currentAccount.name;
		
		try {
			const response = await api.post(apiRoutes.accounts.updateSanctuary, { user, accName, building}, { headers: { 'Content-Type': 'application/json' } });
			if (response.status === 200) {
				console.log(response.data.message);
			} else {
				console.error(response.data.message || `Error: ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			console.error(error.message || 'An unexpected error occured');
		}
	};
	



	return (
			<div className="sanctuary-content container">
				<h3>{currentAccount.name + "'s Sanctuary"}</h3>
				<div className="building-list">
					{buildings.map((build, index) => (
						<div className="mb-3" key={index}>
							<BuildingField key={index} index={index} building={build} update={updateBuilding} />
						</div>
					))}
				</div>
			</div>
	);
}

export default SanctuaryOverview;
