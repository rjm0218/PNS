import {useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule'

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import { useThemeContext } from '../../context/theme.context';

import './allianceevents.css';


function AllianceEvents() {

	const { viewSize } = useThemeContext();
	const [events, setEvents] = useState({});

	
	useEffect(() => {
		async function getEvents() {
			//color: "green',   // an option!
			//textColor: "black" // an option!
			try {
				const response = await api.get('/getAllianceEvents');
				if (response == null) {
					console.log('Failed to get alliance events for calendar.');
				} else {
					let data = response.data.events;
					if (data) {
						setEvents(data);
					}
				}
			} catch (error) {
			  console.error('Failed to get alliance events for calendar.');
			}
		};
		getEvents();
	},[]);

	return (
		<div className="events-container">
			<NavMenu />
			<div className="events-content">
				<h1>Alliance Events</h1>
				<FullCalendar
				  plugins={[ listPlugin, rrulePlugin ]}
				  initialView="listWeek"
				  listDayFormat={{
					month: 'long',
					year: 'numeric',
					day: 'numeric',
					weekday: 'long'
				  }}
				  listDaySideFormat={false}
				  events={events}
				/>
			</div>
		</div>
	);
}

export default AllianceEvents;
