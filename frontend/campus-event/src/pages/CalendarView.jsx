import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [preferences] = useState([
    'academic', 'sports', 'cultural', 'technology', 'workshops', 'social'
  ]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      const data = await response.json();
      
      // Properly format the events for the calendar
      const formattedEvents = data.map(event => {
        // Create Date objects for start and end times
        const eventDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':');
        
        // Set the hours and minutes on the event date
        const startDate = new Date(eventDate);
        startDate.setHours(parseInt(hours), parseInt(minutes));
        
        // Create end date 1 hour after start time by default
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        return {
          id: event._id,
          title: event.title,
          start: startDate,
          end: endDate,
          category: event.category,
          location: event.location,
          description: event.description
        };
      });

      console.log('Formatted events:', formattedEvents); // Debug log
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleFilterChange = (pref) => {
    let newPreferences;
    if (selectedPreferences.includes(pref)) {
      newPreferences = selectedPreferences.filter(p => p !== pref);
    } else {
      newPreferences = [...selectedPreferences, pref];
    }
    setSelectedPreferences(newPreferences);

    if (newPreferences.length === 0) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        newPreferences.includes(event.category.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  };

  // Custom event component to show more details
  const EventComponent = ({ event }) => (
    <div title={`${event.title}\nLocation: ${event.location}\n${event.description}`}>
      <strong>{event.title}</strong>
    </div>
  );

  return (
    <div className="calendar-container">
      <div className="page-header">
        <h1>Event Calendar</h1>
        <p>View all upcoming events in calendar format</p>
      </div>

      <div className="content-container">
        <div className="preference-filters">
          {preferences.map(pref => (
            <label key={pref} className="checkbox-label">
              <input 
                type="checkbox"
                checked={selectedPreferences.includes(pref)}
                onChange={() => handleFilterChange(pref)}
              />
              <span className="capitalize">{pref}</span>
            </label>
          ))}
        </div>

        <div className="calendar-grid">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, margin: '20px' }}
            views={['month', 'week', 'day']}
            defaultView="month"
            components={{
              event: EventComponent
            }}
            popup
            tooltipAccessor={null}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 