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
<Form className="building-entry">
  <div className="mb-2">
    <Form.Label className="building-name">{building.name}</Form.Label>
  </div>
  <Row className="align-items-center">
    <Col xs={7}>
      <Form.Control
        type="number"
        className="level-value"
        value={building.level}
        onChange={handleChange}
        min={0}
        max={maxLevel}
      />
    </Col>
    <Col xs={5} className="level-change d-flex gap-2 justify-content-end">
      <Button variant="light" onClick={() => update(index, parseInt(building.level) + 1)}>+</Button>
      <Button variant="light" onClick={() => update(index, parseInt(building.level) - 1)}>-</Button>
    </Col>
  </Row>
</Form>
	  );
};

export default BuildingField;
