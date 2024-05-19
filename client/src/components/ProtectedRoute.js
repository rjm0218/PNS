import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useLoginContext } from '../context/login.context';



const ProtectedRoute = ({ component}) => {

	const { loggedIn } = useLoginContext();

	if (loggedIn) {
		return component;
	} else {
		return <Navigate to="/" />;
	}

};

export default ProtectedRoute;