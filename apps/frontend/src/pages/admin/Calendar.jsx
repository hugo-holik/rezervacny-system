import { useGetAllEventsQuery, useGetAllExercisesQuery } from '@app/redux/api';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const { data: exercises, isLoading, isError } = useGetAllExercisesQuery();
  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError
  } = useGetAllEventsQuery();
  const [combinedEvents, setCombinedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapovanie cviceni do kalendara
  useEffect(() => {
    if (exercises) {
      const mappedExercises = exercises
        .map((exercise) => {
          return exercise.startTimes.map((startTime) => {
            const startDate = moment(startTime);
            const endDate = moment(startDate).add(exercise.duration, 'minutes');  
            return {
              title: exercise.name,
              start: startDate.toDate(),
              end: endDate.toDate(),
              allDay: false,
              color: exercise.color || '#00bcd4',
              description: exercise.description || ''
            };
          });
        })
        .flat(); 
      setCombinedEvents((prevEvents) => [...prevEvents, ...mappedExercises]);
    }
  }, [exercises]);


  // Mapovanie eventov do kalendara eventov
  useEffect(() => {
    if (events) {
      const mappedEvents = events.map((event) => {
        const startDate = moment(event.datefrom); 
        const endDate = moment(event.dateto); 
        return {
          title: event.name,
          start: startDate.toDate(),
          end: endDate.toDate(),
          allDay: false,
          color: event.published ? '#00bcd4' : '#f44336', 
          description: ''
        };
      });
      console.log(mappedEvents); 
      setCombinedEvents((prevEvents) => [...prevEvents, ...mappedEvents]);
    }
  }, [events]);
  

  if (isLoading || isEventsLoading) return <div>Načítavanie...</div>;
  if (isError || isEventsError) return <div>Error načítavania</div>;

  //otvorenie okna pre cvicenie
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleJoinRequest = () => {
    if (selectedEvent) {
      alert(`Requested to join event: ${selectedEvent.title}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ height: '100vh' }}>
      <BigCalendar
        localizer={localizer}
        events={combinedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color
          }
        })}
        onSelectEvent={handleEventClick} // Handle event click
      />

      {/* Modal for event details */}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Event Details"
        ariaHideApp={false}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px'
          }
        }}
      >
        <h2>{selectedEvent?.title}</h2>
        <p>{selectedEvent?.description}</p>
        <p>
          <strong>Start:</strong> {moment(selectedEvent?.start).format('LLLL')}
        </p>
        <p>
          <strong>End:</strong> {moment(selectedEvent?.end).format('LLLL')}
        </p>
        <button onClick={handleJoinRequest}>Request to Join</button>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

// const Calendar = () => {
//   return <div>Calendar</div>;
// };

export default Calendar;
