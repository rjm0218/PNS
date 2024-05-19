import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Table } from 'react-bootstrap';


import { useThemeContext } from '../context/theme.context';;

const ObjectTable = ({obj, headers, sortConfig, name}) => {
	
	const { viewSize } = useThemeContext();
	const [data, setSortedItems] = useState(obj);
	const [dir, setDir] = useState('');
	const [sortBy, setSortBy] = useState('');
	const [ showSortUi ] = useState(true);
	const isBigScreen = useMediaQuery({ query: '(min-width: 1224px)' })

	return (
		<Table responsive='md' className={name}>
			<thead>
				<tr>
					{headers.map(header => (
						<th key={header}>{header}{' '}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((entry,index) => (
					<tr key={index}>
						{headers.map((header,index) => (
							<td key={header+index}>{entry[header]}</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default ObjectTable;