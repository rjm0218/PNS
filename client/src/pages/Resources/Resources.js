import { useState, useEffect, useContext } from 'react';

import {api} from '../../axios_config';
import NavMenu from '../../components/NavMenu';
import AccountSelection from '../../components/AccountSelection';
import { AccountProvider, useAccountContext } from '../../context/account.context';
import { useLoginContext } from '../../context/login.context';

import './resources.css';

function Resources({ onLogout }) {


  return (
    <div className="resources-container">
		<NavMenu />
		<div className="dashboard-content grocery-content">
			<h1>Resource List</h1>
		</div>
	</div>
  );
}

export default Resources;