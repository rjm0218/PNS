import apiRoutes from '../../utils/apiRoutes';
import React, { useState, useEffect } from 'react';
import {Form, FloatingLabel, Row, Col} from 'react-bootstrap';

import {api} from '../../axios_config.js';
import Table from '../../components/Table';
import { useThemeContext } from '../../context/theme.context';
import { useAccountContext } from '../../context/account.context';

import './sanctuary.css';

function PlanAhead({buildings}) {
	
	let timer;
	const { viewSize } = useThemeContext();
	const {currentAccount} = useAccountContext();
	const [targetBuilding, setTargetBuild] = useState(null);
	const [targetLevel, setTargetLevel] = useState(null);
	const [ tData, setTData] = useState([]);
	const [ tHeaders, setTHeaders] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	
	useEffect(() => {
		
		const getReqData = async () => {
			setIsLoading(true);
			console.log("Getting info for building: " + targetBuilding + " to level: " + targetLevel);
			try {
				const response = await api.post(apiRoutes.planner.costEstimate, {
					curAcc: currentAccount,
					targetBuilding: { name: targetBuilding, level: targetLevel }
				});
				if (response != null && response.status === 200 && response.data.data) {
					const {tableData } = response.data.data;
					const resourceLabels = ['food','wood','steel','gas','building engin','blueprint','nanotube'];
					setTHeaders(['Building', ...resourceLabels]);
					setTData(tableData);
				}
			} catch (error) {
				console.error(error.response ? error.response.data : 'No response');
			}
			setIsLoading(false);
		};
		
		if (targetLevel && buildings.length > 0) {
			getReqData();
		}
		
	}, [targetBuilding, targetLevel, buildings, currentAccount]);
	
	const handleChange =  (event) => {
		
		clearTimeout(timer);
		timer = setTimeout(() => {
			setTargetLevel(event.target.value);
		}, 500);

	};
	

	return (
			<div className="plan-ahead">
				<h3>Building Planning</h3>
				<Row className="mb-3">
					<Col xs='auto'>
						<FloatingLabel
						  controlId="floatingSelectGrid"
						  label="Target Building"
						>
							<Form.Select 
								aria-label="Floating label select example"
								size={viewSize}
								onChange={(ev) => setTargetBuild(ev.target.value)}
							>
								<option>Select target building</option>
								{buildings.map((build, index) => (
									<option key={build.name} value={build.name}>{build.name}</option>
								))}
						  </Form.Select>
						</FloatingLabel>
					</Col>
					<Col xs='auto'>
					{targetBuilding &&
						<FloatingLabel
						  controlId="floatingSelectGrid"
						  label="Target Level"
						>
							<Form.Control size={viewSize} type='level' placeholder='Target Level' onChange={(event) => handleChange(event)}/>
						</FloatingLabel>					
					}
					</Col>
				</Row>
				<Row className="mb-3">
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<>
							{tData.length > 0 && <Table obj={tData} headers={tHeaders} name='req-table' />}
							{targetLevel && tData.length === 0 && <p>Your {targetBuilding} is already above level {targetLevel}</p>}
						</>
					)}
				</Row>
			</div>
	);
}

export default PlanAhead;
