import { createContext, useState, useContext, useEffect } from 'react';

import {api} from '../axios_config.js';

const LoginContext = createContext();

const LoginProvider = ({ children}) => {

	const [loggedIn, setLoggedIn] = useState(false);
	const [user, setUsername] = useState(null);
	const [initialized, setInitialized] = useState(false); // New state to track initialization

	
	useEffect(() => {
		const username = localStorage.getItem('username');
		if(username) {
			setUsername(username);
			setLoggedIn(true);
		}
		setInitialized(true); // Mark initialization as complete
	},[]);
	
	const handleLogout = async (e) => {
		try {
			const response = await api.post('/logout', {user});
			if (response == null) {
				console.log('Failed to logout ', user);
			} else {
				console.log('Logged out: ', user);
			}
		} catch (error) {
		  console.error('Error trying to logout:', error.response ? error.response.data : 'No response');
		}
		e.preventDefault();
		setLoggedIn(false);
		localStorage.clear();
	};
	
	const setUser = (name) => {
		localStorage.setItem('username',name);
		setUsername(name);
	};
	
	return (
		<LoginContext.Provider
		  value={{
			loggedIn,
			setLoggedIn,
			handleLogout,
			user,
			setUser
		  }}
		>
		  {initialized && children}
		</LoginContext.Provider>
  );
	
};

const useLoginContext = () => useContext(LoginContext);

export { LoginProvider, useLoginContext };