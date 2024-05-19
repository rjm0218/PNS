import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Table } from 'react-bootstrap';

import SortButton from './SortButton';

import sortTableData from './helpers/sortTableData'

import { useThemeContext } from '../context/theme.context';;

const ObjectTable = ({obj, headers, sortConfig, name}) => {
	
	const { viewSize } = useThemeContext();
	const [data, setSortedItems] = useState(obj);
	const [dir, setDir] = useState('');
	const [sortBy, setSortBy] = useState('');
	const [ showSortUi ] = useState(true);
	const isBigScreen = useMediaQuery({ query: '(min-width: 1224px)' })
	
	useEffect(() => {
		setSortedItems(obj);
	},[obj]);
	
	const handleClick = event => {
		const sortDir = dir === 'des' ? 'asc' : 'des';
		setDir(sortDir);
		setSortBy(event.target.id);
		const sortConfig = { sortBy: event.target.id, dir: sortDir}
		setSortedItems(sortTableData(obj, sortConfig));
	}

	return (
		<Table responsive={isBigScreen ? 'md' : 'sm'} className={name}>
			<thead>
				<tr>
					{headers.map(header => (
						<th key={header}>{header}{' '}
							{showSortUi && header !== 'Delete' && (
								<SortButton
									key={header+"button"}
									dir={dir}
									id={header}
									onClick={handleClick}
									sortBy={sortBy}
								/>
							)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((entry,index) => (
					<tr key={index}>
						{headers.map(header => (
							<td key={header+entry.Name}>{entry[header]}</td>
						))}
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default ObjectTable;