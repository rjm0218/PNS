import { useEffect } from 'react';
import { useAccountContext } from '../context/account.context';
import {InputGroup, DropdownButton, Dropdown} from 'react-bootstrap';	
import {api} from '../axios_config.js';

import './css/components.css';

function AccountSelection() {
	
	const username = localStorage.getItem('username');
	const {accounts, currentAccount, setCurrentAccount, setAllAccounts} = useAccountContext();
  
	useEffect(() => {
		const getUserData = async () => {
			try {
			  const response = await api.post('/getAccounts', { username}, {withCredentials: true});
			  if (response.status === 200) {
				  const accs = response.data.accs;
				  if (accs.length > 0) {
					setAllAccounts(accs);
					if (currentAccount === null) {
						setCurrentAccount(accs[0]);
					}
				  }
			  } else {
				console.error('Error:', response.statusText);
			  }
			} catch (error) {
			  console.error('Error fetching user data:', error.message);
			}
		};
		
		if (accounts === null || accounts.length === 0) {
			let accs = JSON.parse(localStorage.getItem('accounts'));
			if (accs !== null) {
				setAllAccounts(accs);
			} else {
				getUserData();
			}
		}
	}, []);
	
	const handleAccChange = (acc) => {
		setCurrentAccount(acc);
	}
	
	return (
		<div className='account-selection'>
			<p>Current Account:</p>
			<InputGroup size="sm" className='account-drop'>
				<InputGroup.Text className="acc-name">{currentAccount.name}</InputGroup.Text>
				<DropdownButton
					variant="secondary"
					id='acc-selection'
					title=''
				>
					{accounts != null && accounts.map((acc, index) => (
						<Dropdown.Item key={index} position="right" onClick={() => handleAccChange(acc)}>{acc.name}</Dropdown.Item>
					))}
				</DropdownButton>
			</InputGroup>
		</div>
	);
}

export default AccountSelection;