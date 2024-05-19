import { Button} from 'react-bootstrap';

const SortButton = ({dir, id, onClick, sortBy}) => {
	const arrows = { asc: '↓', des : '↑'};
	const arrow = sortBy === id ? arrows[dir] : '↕︎';
	
	return (
		<Button id={id} onClick={onClick}>
			{arrow}
			<span className='visually-hidden'>Sort {dir}</span>
		</Button>
	)
}

export default SortButton;