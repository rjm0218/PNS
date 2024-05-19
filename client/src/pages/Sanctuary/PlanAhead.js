import React, { useState, useEffect } from 'react';
import {Form, FloatingLabel, Row, Col} from 'react-bootstrap';

import {api} from '../../axios_config.js';
import Table from '../../components/Table';
import { useThemeContext } from '../../context/theme.context';
import { useAccountContext } from '../../context/account.context';

import {getTotalCost} from './BuildCost';

import './sanctuary.css';

function PlanAhead({buildings}) {
	
	let timer;
	const { viewSize } = useThemeContext();
	const {currentAccount} = useAccountContext();
	const [targetBuilding, setTargetBuild] = useState(null);
	const [targetLevel, setTargetLevel] = useState(null);
	const [ tData, setTData] = useState([]);
	const [ tHeaders, setTHeaders] = useState([]);
	
	useEffect(() => {
		
		const getReqData = async () => {
			console.log("Getting info for building: " + targetBuilding + " to level: " + targetLevel);
			let target = {'name': targetBuilding, 'level': targetLevel};
			try {
				const response = await api.post('/getBuildRequirements');
				if (response != null) {
					let data = response.data;
					if (data != null) {
						let req = data.doc.requirements;
						let rss = await getTotalCost(req, buildings, target, currentAccount);
						if (rss) {
							let headers = ['Resource'];
							headers.push('Total');
							let builds = rss.buildings;
							for (let i= 0; i < builds.length; i++) {
								headers.push(builds[i].name + " (" + builds[i].level + ")");
								
							}
							
							setTHeaders(headers);
							let rssData = [];
							let rssNames = rss.totals.map(ele => ele.name);
							
							
							// Dynamically set key-value pairs based on 'attributes'
							for (let i = 0; i < rssNames.length; i++) {
								let obj = {};
								obj['Resource'] = rssNames[i];
								for (let j = 0; j < builds.length; j++) {
									let attr = headers[j+2];
									obj[attr] = rss.perCost[j][i].toLocaleString();
								}
								obj['Total'] = rss.totals.find(ele => ele.name === rssNames[i]).amount.toLocaleString();
								// Push the dynamically created object into 'data'
								rssData.push(obj);
							}
							
							console.log(rssData);
							setTData(rssData);
						} else {

						}							
					}
				}
			} catch (error) {
				console.error(error.response ? error.response.data : 'No response');
			}
		};
		
		if (targetLevel) {
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
					{tData.length > 0 &&
						<Table obj={tData} headers={tHeaders} name='req-table' />
					}
					{targetLevel && tData.length === 0 &&
						<p>Your {targetBuilding} is already above level {targetLevel}</p>
					}
				</Row>
			</div>
	);
}

export default PlanAhead;