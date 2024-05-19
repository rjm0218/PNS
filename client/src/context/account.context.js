import { createContext, useState, useContext, useEffect } from 'react';

const AccountContext = createContext();

const AccountProvider = ({ children}) => {
	const [accounts, setAccounts] = useState([]);
	const [currentAccount, setCurAcct] = useState(null);
	const [initialized, setInitialized] = useState(false); // New state to track initialization
	
	
	useEffect(() => {
		const curAcc = localStorage.getItem('curAcc');
		if(curAcc) {
			setCurAcct(JSON.parse(localStorage.getItem('curAcc')));
		}
		setInitialized(true); // Mark initialization as complete
	},[]);
	
	const setAllAccounts = (accs) => {
		localStorage.setItem('accounts',JSON.stringify(accs));
		setAccounts(accs);
	}
	
	const addAccount = (account) => {
		localStorage.setItem('accounts',JSON.stringify([...accounts, account]));
		setAccounts([...accounts, account]);
	};
	
	const removeAccount = (accountId) => {
		setAccounts(accounts.filter(account => account.id !== accountId));
	};

	const setCurrentAccount = (acc) => {
		if (localStorage.getItem('rssData')) {
			localStorage.removeItem('rssData');
		}
		localStorage.setItem('curAcc',JSON.stringify(acc));
		setCurAcct(acc);
	};
	

	
	return (
		<AccountContext.Provider
		  value={{
			accounts,
			setAllAccounts,
			currentAccount,
			addAccount,
			removeAccount,
			setCurrentAccount
		  }}
		>
		  {initialized && children}
		</AccountContext.Provider>
  );
	
};

const useAccountContext = () => useContext(AccountContext);

export { AccountProvider, useAccountContext };