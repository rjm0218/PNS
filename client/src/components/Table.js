import { useState } from 'react';
import { Table } from 'react-bootstrap';


import { useThemeContext } from '../context/theme.context';;

const ObjectTable = ({obj, headers, sortConfig, name}) => {
	
	const { viewSize } = useThemeContext();
	const [data] = useState(obj);


	return (
			<Table responsive className={name}>
				<thead>
					<tr>
						{headers.map(header => (
							<th key={header}>{header.charAt(0).toUpperCase() + header.slice(1)}{' '}</th>
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
