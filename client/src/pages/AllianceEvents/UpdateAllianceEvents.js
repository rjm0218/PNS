import {useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule'
import { datetime } from 'rrule';

import { Button, Row, Col, InputGroup, Form, Accordion } from 'react-bootstrap';

import {api} from '../../axios_config.js';
import NavMenu from '../../components/NavMenu';
import { useThemeContext } from '../../context/theme.context';

import './allianceevents.css';

const daysOfWeekRRule = ['su','mo','tu','we','th','fr','sa'];
const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const eventTemplate = {'title': null, 'duration': null, 'index': null, 'rrule': {'freq': 'weekly', 'interval':null,'byweekday':[],'dtstart': null}}

function UpdateAllianceEvents() {
	
	let timer;
	const { viewSize } = useThemeContext();
	const [events, setEvents] = useState([]);
	const [modal, setModal] = useState(false);
	const [newEvent, setNewEvent] = useState(eventTemplate);
	const [isCheckedDays, setCheckedDays] = useState(Array.from({ length: daysOfWeekRRule.length }).fill(false));
	const [wasEdited, setWasEdited] = useState([]);
	
	useEffect(() => {
		async function getEvents() {

			try {
				const response = await api.get('/getAllianceEvents');
				if (response == null) {
					console.log('Failed to get alliance events for calendar.');
				} else {
					let data = response.data.events;
					if (data) {
						setEvents(data.events);
						setWasEdited(Array.from({ length: data.events.length }).fill(false));
					}
				}
			} catch (error) {
			  console.error('Failed to get alliance events for calendar.');
			}
		};
		getEvents();
	},[]);
	
	
	function formatDate(dateString) {
		  // Create a new Date object from the date string
		  const utcDate = new Date(dateString);
		  //const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);

		  // Extract the date components
		  const year = utcDate.getFullYear();
		  const month = String(utcDate.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
		  const day = String(utcDate.getDate()).padStart(2, '0'); // Add leading zero if needed

		  // Construct the formatted date string
		  const formattedDate = `${year}-${month}-${day}`; //${hours}:${minutes}:${seconds}

		  return formattedDate;
	}
	
	function formatTime(dateString) {
		  // Create a new Date object from the date string
		  const utcDate = new Date(dateString);
		  //const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);

		  // Extract the time components
		  const hours = String(utcDate.getHours()).padStart(2, '0'); // Add leading zero if needed
		  const minutes = String(utcDate.getMinutes()).padStart(2, '0'); // Add leading zero if needed
		  const seconds = String(utcDate.getSeconds()).padStart(2, '0'); // Add leading zero if needed

		  // Construct the formatted date string
		  const formattedTime = `${hours}:${minutes}:${seconds}`;

		  return formattedTime;
	}
	
	async function updateDB(eve, evIdx) {
		
		if (!eve['index']) {
			eve['index'] = evIdx;
		}
		
		const localDate = new Date(eve.rrule.dtstart);
		const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
		// Extract the date components
		const year = utcDate.getFullYear();
		const month = utcDate.getMonth() + 1; // Add leading zero if needed
		const day = utcDate.getDate(); // Add leading zero if needed
		const hours = utcDate.getHours(); // Add leading zero if needed
		const minutes = utcDate.getMinutes(); // Add leading zero if needed
		eve.rrule.dtstart = datetime(year, month, day, hours, minutes);
		
		let tarEve = JSON.stringify(eve);
		
		try {
			const response = await api.post('/updateAllianceEvent', { tarEve, evIdx});
			if (response == null) {
				console.log('Failed to update alliance events for calendar.');
			}
		} catch (error) {
		  console.error('Failed to update alliance events for calendar.');
		}
	}
	
	const handleSave = (evindex) => {
		let eve = events[evindex];
		updateDB(eve, evindex);
		let newEditList = [...wasEdited];
		newEditList[evindex] = false;
		setWasEdited(newEditList);
	}
	
	const handleDelete = async (evindex) => {
		
		let eve = events[evindex];
		let tarEve = JSON.stringify(eve);
		
		try {
			const response = await api.post('/removeAllianceEvent', { tarEve});
			if (response.status === 200) {
				let newEventList = events.filter(ev => ev.title !== events[evindex].title);
				setEvents(newEventList);
			} else {
				console.error('Error:', response.statusText);
			}
		} catch (error) {
			console.error('Error deleting event data:', error.message);
			return;
		}

	}
	
	const handleChange = (evindex, attr, value) => {
		let newEventList = [...events];
		
		if (attr === 'duration') {
			newEventList[evindex][attr] = {'days': value};
		} else {
			newEventList[evindex][attr] = value;
		}
		
		setEvents(newEventList);
		
		let newEditList = [...wasEdited];
		newEditList[evindex] = true;
		setWasEdited(newEditList);
	}
	
		
	const handleCheck = (evindex, dayIdx) => {
		let newEventList = [...events];
		if (newEventList[evindex].rrule.byweekday.includes(daysOfWeekRRule[dayIdx])) {
			let newArray = newEventList[evindex].rrule.byweekday.filter(day => day !== daysOfWeekRRule[dayIdx]);
			newEventList[evindex].rrule.byweekday = newArray;
		} else {
			newEventList[evindex].rrule.byweekday.push(daysOfWeekRRule[dayIdx]);
		}
		setEvents(newEventList);
		let newEditList = [...wasEdited];
		newEditList[evindex] = true;
		setWasEdited(newEditList);
	}
	
	const handleDateChange = (evindex, date) => {

		let newEventList = [...events];
		let found = newEventList[evindex].rrule.dtstart.match(/.*T(?<time>\d{2}:\d{2})/);
		if (found) {
			let newEventList = [...events];
			newEventList[evindex].rrule.dtstart = date + 'T' + found.groups.time;
			setEvents(newEventList);
			let newEditList = [...wasEdited];
			newEditList[evindex] = true;
			setWasEdited(newEditList);
		}

	}
	
	const handleTimeChange = (evindex, time) => {

		let newEventList = [...events];
		let found = newEventList[evindex].rrule.dtstart.match(/(?<date>\d{4}-\d{2}-\d{2})T.*/);
		if (found) {
			newEventList[evindex].rrule.dtstart = found.groups.date + 'T' + time;
			setEvents(newEventList);
			let newEditList = [...wasEdited];
			newEditList[evindex] = true;
			setWasEdited(newEditList);
		}

	}
	
	const createNewEvent = (tempEvent, attr, value) => {
		
		if (attr === 'submit') {
			setEvents([...events,tempEvent]);
			updateDB(tempEvent,events.length);
			setNewEvent(eventTemplate);
			setModal(false)
			return;
		}
		
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (tempEvent[attr] !== undefined) {
				if (attr === 'duration') {
					tempEvent[attr] = {'days': value};
				} else {
					tempEvent[attr] = value;
				}
			} else {
				if (tempEvent.rrule[attr] !== undefined && !(tempEvent.rrule[attr] instanceof Array)) {
					tempEvent.rrule[attr] = value;
				} else if (tempEvent.rrule[attr] !== undefined && tempEvent.rrule[attr] instanceof Array) {
					let newCheckList;
					if (tempEvent.rrule[attr].includes(value)) {
						let dayIdx = daysOfWeekRRule.findIndex(day => day === value);
						newCheckList = [...isCheckedDays];
						newCheckList[dayIdx] = false;
						tempEvent.rrule[attr].pop(daysOfWeekRRule[dayIdx-1]);
					} else {	
						let dayIdx = daysOfWeekRRule.findIndex(day => day === value);
						newCheckList = [...isCheckedDays];
						newCheckList[dayIdx] = true;
						tempEvent.rrule[attr].push(daysOfWeekRRule[dayIdx-1]);
					}
					setCheckedDays(newCheckList);
				} else {
					if (attr !== 'date' && attr !== 'time') {
						console.log('Invalid attribute');
						return;
					} else if (attr === 'date') {
						tempEvent.rrule['dtstart'] = value + 'T' + formatTime(tempEvent.rrule['dtstart']);
					} else {
						tempEvent.rrule['dtstart'] = formatDate(tempEvent.rrule['dtstart']) + 'T' + value;
					}
				}
			}
			setNewEvent(tempEvent);
		}, 500);
		
		
	}
	
	const Modal = () => {
		return (
			<div className="modal-overlay">
				<div className="modal-container">
					<div className="modal-header">
						<button className="btn btn--close" onClick={() => setModal(false)} >
							<span>&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<h3>
							Event Creation
						</h3>
						<Row xs={2} className='mb-3'>
							<Col>
								<h5>Event Name</h5>
								<Form.Control size='sm' type="text"
									className='name-box'
									defaultValue={newEvent.title}
									onChange={(eve) => createNewEvent(newEvent,'title', eve.target.value)}
								/>
							</Col>
							<Col className='mb-3'>
								<h5>Frequency</h5>
								<Form.Select 
									aria-label="Default select example"
									defaultValue={newEvent.rrule.freq}
									onChange={(eve) => createNewEvent(newEvent,'freq', eve.target.value)}
								>
								  <option value="yearly">Yearly</option>
								  <option value="monthly">Monthly</option>
								  <option value="weekly">Weekly</option>
								  <option value="daily">Daily</option>
								  <option value="minutely">Minutely</option>
								  <option value="secondly">Secondly</option>
								</Form.Select>
							</Col>
							<Col className='mb-3'>
								<h5>Interval</h5>
								<Form.Control size='sm' type="text"
									className='interval-box'
									defaultValue={newEvent.rrule.interval}
									onChange={(eve) => createNewEvent(newEvent,'interval', parseInt(eve.target.value))}														
								/>
							</Col>
							<Col className='mb-3'>
								<h5>Duration</h5>
								<Form.Control size='sm' type="text"
									className='duration-box'
									defaultValue={newEvent.duration}
									onChange={(eve) => createNewEvent(newEvent,'duration', parseInt(eve.target.value))}														
								/>
							</Col>
							<Col className='mb-3'>
								<h5>Start Date</h5>
								<Form.Control size='sm' type="date"
								  defaultValue={newEvent.rrule.dtstart ? formatDate(newEvent.rrule.dtstart) : formatDate(new Date())}
								  onChange={(eve) => createNewEvent(newEvent,'date', eve.target.value)}
								/>
							</Col>
							<Col className='mb-3'>
								<h5>Start Time</h5>
								<Form.Control size='sm' type="time"
									defaultValue={newEvent.rrule.dtstart ? formatTime(newEvent.rrule.dtstart) : formatTime(new Date())}
								  onChange={(eve) => createNewEvent(newEvent,'time', eve.target.value)}
								/>
							</Col>
							<Col className='mb-3'>
								<h5>Event Days</h5>
								{daysOfWeek.map((day, dayIdx) => (
									<Form.Check
										size={viewSize}
										type='checkbox'
										label={day}
										className='day-option'
										key={day}
										checked={isCheckedDays[dayIdx]}
										onChange={(eve) => createNewEvent(newEvent,'byweekday', daysOfWeekRRule[dayIdx])}	
									/>
								))}
							</Col>
						</Row>
						<Row>
							<Col xs={{offset: 7}}>
								<Button variant="primary" onClick={() => createNewEvent(newEvent,'submit',0)}>Add Event</Button>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="events-container">
			<NavMenu />
			<div className="events-content">
				<Button variant="secondary" size={viewSize} className="add-button" onClick={() => setModal(true)}>Create Event</Button>
				{modal && <Modal transparent={true}/>}
				<h1>Alliance Events</h1>
				<Accordion>
					{events.length > 0 && events.map((ev, evindex) => (
						<Accordion.Item key={'item'+evindex} eventKey={evindex} className='event-info'>
							<Accordion.Header key={'header'+evindex} className='event-header'>
								<h6>{ev.title}</h6>
							</Accordion.Header>
							<Accordion.Body key={'body'+evindex} className='event-body'>
								<Row xs={2} sm={3} md={4} lg={5} className='mb-3'>
									<Col>
										<strong>Event Name</strong>
										<Form.Control size='sm' type="text"
											className='name-box'
											defaultValue={ev.title}
											onChange={(eve) => handleChange(evindex, 'title', eve.target.value)}
										/>
									</Col>
									<Col className='mb-3'>
										<strong>Frequency</strong>
										<Form.Select 
											aria-label="Default select example"
											defaultValue={ev.rrule.freq}
											onChange={(eve) => handleChange(evindex, 'freq', eve.target.value)}
										>
										  <option value="yearly">Yearly</option>
										  <option value="monthly">Monthly</option>
										  <option value="weekly">Weekly</option>
										  <option value="daily">Daily</option>
										  <option value="minutely">Minutely</option>
										  <option value="secondly">Secondly</option>
										</Form.Select>
									</Col>
									<Col className='mb-3'>
										<strong>Interval</strong>
										<Form.Control size='sm' type="text"
											className='interval-box'
											defaultValue = {ev.rrule.interval}
											onChange={(eve) => handleChange(evindex, 'interval', parseInt(eve.target.value))}														
										/>
									</Col>
									<Col className='mb-3'>
										<strong>Duration (days)</strong>
										<Form.Control size='sm' type="text"
											className='duration-box'
											defaultValue={ev.duration ? Object.values(ev.duration) : ''}
											onChange={(eve) => handleChange(evindex,'duration', parseInt(eve.target.value))}														
										/>
									</Col>
									<Col className='mb-3'>
										<strong>Start Date</strong>
										<Form.Control size='sm' type="date"
										  onChange={(eve) => handleDateChange(evindex,eve.target.value)}
										  defaultValue={formatDate(ev.rrule.dtstart)}
										/>
									</Col>
									<Col className='mb-3'>
										<strong>Start Time</strong>
										<Form.Control size='sm' type="time"
										  onChange={(eve) => handleTimeChange(evindex,eve.target.value)}
										  defaultValue={formatTime(ev.rrule.dtstart)}
										/>
									</Col>
									<Col className='mb-3'>
										<strong>Event Days</strong>
										{daysOfWeek.map((day, dayIdx) => (
											<Form.Check
												size={viewSize}
												type='checkbox'
												label={day}
												className='day-option'
												key={day}
												checked={ev.rrule.byweekday.includes(daysOfWeekRRule[dayIdx+1])}
												onChange={() => handleCheck(evindex, dayIdx+1)}
											/>
										))}
									</Col>
									<Col className='mb-3'>
										{wasEdited[evindex] && 
											<Button key={'savebutton'+evindex} variant="primary" onClick={() => handleSave(evindex)}>Save</Button>
										}
										<Button key={'delbutton'+evindex} variant="danger" onClick={() => handleDelete(evindex)}>Delete Event</Button>
									</Col>
								</Row>
							</Accordion.Body>
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		</div>
	);
}

export default UpdateAllianceEvents;
