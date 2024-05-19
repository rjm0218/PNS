import { Button, Col, Row, Form } from 'react-bootstrap';

import { useThemeContext } from '../context/theme.context';

import './css/components.css';

const maxLevel = 40;

const BuildingField = ({index, building, update}) => {
	
	const { viewSize } = useThemeContext();
	let timer;
	
	const handleChange =  (event) => {
		
		clearTimeout(timer);
		timer = setTimeout(() => {
			update(index,event.target.value);
		}, 500);

	};
	
	return (
		<Form >
			<Form.Group as={Row} className='building-entry'>
				<Form.Label className='building-name'>
					{building.name}
				</Form.Label>
				<Form.Control type='level' className='level-value' placeholder={building.level} onChange={handleChange} />
				<div className='level-change'>
					<Button variant="light" onClick={() =>update(index,parseInt(building.level)+1)}>+</Button>
					<Button variant="light" onClick={() =>update(index,parseInt(building.level)-1)}>-</Button>
				</div>
			</Form.Group>
		</Form>
	);
};

export default BuildingField;