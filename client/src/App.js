import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Sanctuary from './pages/Sanctuary/Sanctuary';
import Resources from './pages/Resources/Resources';
import AllianceEvents from './pages/AllianceEvents/AllianceEvents';
import UpdateAllianceEvents from './pages/AllianceEvents/UpdateAllianceEvents';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AccountProvider } from './context/account.context';
import { LoginProvider } from './context/login.context';
import { ThemeProvider } from './context/theme.context';

import './App.css';


function App() {
	
  return (
    <div className='app'>
		<ThemeProvider>
			<LoginProvider>
				<AccountProvider>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route 
							path="/dashboard" 
							element={<ProtectedRoute component={<Dashboard />}></ProtectedRoute>}
						/>
						<Route 
							path="/inventory" 
							element={<ProtectedRoute component={<Inventory />}></ProtectedRoute>}
						/>
						<Route 
							path="/sanctuary" 
							element={<ProtectedRoute component={<Sanctuary />}></ProtectedRoute>}
						/>
						<Route 
							path="/resources" 
							element={<ProtectedRoute component={<Resources />}></ProtectedRoute>}
						/>
						<Route 
							path="/allianceevents" 
							element={<ProtectedRoute component={<AllianceEvents />}></ProtectedRoute>}
						/>
						<Route 
							path="/updateallevents" 
							element={<ProtectedRoute component={<UpdateAllianceEvents />}></ProtectedRoute>}
						/>
					</Routes>
				</AccountProvider>
			</LoginProvider>
			<Footer/>
		</ThemeProvider>
    </div>
  );
}

export default App;
