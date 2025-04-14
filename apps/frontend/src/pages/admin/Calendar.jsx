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
            const startDate = moment(exercise._id).set({
              hour: parseInt(startTime.split(':')[0]),
              minute: parseInt(startTime.split(':')[1])
            });
            const endDate = moment(startDate).add(exercise.duration, 'minutes');

            return {
              title: exercise.name,
              start: startDate.toDate(),
              end: endDate.toDate(),
              allDay: false,
              color: exercise.color || '#00bcd4',
              description: exercise.description || '' // Assuming there's a description field
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
        return {
          title: event.name,
          start: new Date(event.start), // Assuming `start` is a valid date field
          end: new Date(event.end), // Assuming `end` is a valid date field
          allDay: false,
          color: event.color || '#00bcd4', // Assuming `color` is available
          description: event.description || '' // Assuming `description` is available
        };
      });
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
