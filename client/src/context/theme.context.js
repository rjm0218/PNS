import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children}) => {

	const [viewSize, setViewSize] = useState('');
	
	useEffect(() => {
		
		const handleResize = () => {
			switch (true) {
				case (window.innerWidth < 576):
					setViewSize('');
					break;
				case (window.innerWidth < 768):
					setViewSize('sm');
					break;
				case (window.innerWidth < 992):
					setViewSize('md');
					break;
				case (window.innerWidth < 1200):
					setViewSize('lg');
					break;
				case (window.innerWidth < 1400):
					setViewSize('xl');
					break;
				case (window.innerWidth >= 1400):
					setViewSize('xxl');
					break;
				default:
					setViewSize('sm');
			}
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		}
		
	},[]);
	
	return (
		<ThemeContext.Provider
		  value={{
			viewSize
		  }}
		>
		  {children}
		</ThemeContext.Provider>
  );
	
};

const useThemeContext = () => useContext(ThemeContext);

export { ThemeProvider, useThemeContext };