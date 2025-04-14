import { useGetAllEventsQuery, useGetAllExercisesQuery } from '@app/redux/api';
import moment from 'moment';
import 'moment/locale/sk'; // Import Slovak locale
import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import './CalendarCustom.css';

// Set moment to use Slovak locale
moment.locale('sk', {
  months: 'január_február_marec_apríl_máj_jún_júl_august_september_október_november_december'.split(
    '_'
  ),
  monthsShort: 'jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec'.split('_'),
  weekdays: 'nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota'.split('_'),
  weekdaysShort: 'ne_po_ut_st_št_pi_so'.split('_'),
  weekdaysMin: 'ne_po_ut_st_št_pi_so'.split('_')
});

const localizer = momentLocalizer(moment);

// Complete Slovak translations for the calendar
const messages = {
  allDay: 'Celý deň',
  previous: '< ',
  next: ' >',
  today: 'Dnes',
  month: 'Mesiac',
  week: 'Týždeň',
  day: 'Deň',
  agenda: 'Agenda',
  date: 'Dátum',
  time: 'Čas',
  event: 'Udalosť',
  noEventsInRange: 'Žiadne udalosti v tomto období.',
  showMore: (total) => `+${total} viac`,
  work_week: 'Pracovný týždeň',
  tomorrow: 'Zajtra',
  yesterday: 'Včera'
};

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

  // Map exercises
  useEffect(() => {
    if (exercises) {
      const mappedExercises = exercises
        .map((exercise) =>
          exercise.startTimes.map((startTime) => {
            const start = moment(startTime);
            const end = moment(start).add(exercise.duration, 'minutes');
            return {
              title: exercise.name,
              start: start.toDate(),
              end: end.toDate(),
              allDay: false,
              color: exercise.color || '#00bcd4',
              description: exercise.description || ''
            };
          })
        )
        .flat();
      setCombinedEvents(mappedExercises);
    }
  }, [exercises]);

  // Map events
  useEffect(() => {
    if (events) {
      const mappedEvents = events.map((event) => {
        const start = moment(event.datefrom);
        const end = moment(event.dateto);
        return {
          title: event.name,
          start: start.toDate(),
          end: end.toDate(),
          allDay: false,
          color: event.published ? '#4caf50' : '#f44336',
          description: ''
        };
      });
      setCombinedEvents((prev) => [...prev, ...mappedEvents]);
    }
  }, [events]);

  if (isLoading || isEventsLoading) return <div>Načítavanie...</div>;
  if (isError || isEventsError) return <div>Chyba načítavania</div>;

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleJoinRequest = () => {
    if (selectedEvent) {
      alert(`Žiadosť o pripojenie: ${selectedEvent.title}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-box">
        <BigCalendar
          localizer={localizer}
          events={combinedEvents}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day']}
          onSelectEvent={handleEventClick}
          style={{ height: '75vh' }}
          messages={messages}
          culture="sk" // This ensures proper localization
          formats={{
            monthHeaderFormat: 'MMMM YYYY', // Full month name in Slovak
            dayFormat: 'D. MMMM', // Day with full month name
            weekdayFormat: 'dddd', // Full weekday name
            timeGutterFormat: 'HH:mm' // Time format
          }}
          eventPropGetter={(event) => {
            const baseColor = event.color || '#4299e1';
            const transparentBg = baseColor + '99'; // ~13% opacity

            return {
              className: 'custom-event',
              style: {
                borderLeft: `4px solid ${baseColor}`,
                backgroundColor: transparentBg,
                border: `1px solid ${baseColor}`,
                color: '#2d3748',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.8rem',
                marginInline: '5px',
                boxShadow: `0 2px 4px ${baseColor}33`,
                transition: 'all 0.2s ease'
              }
            };
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        className="calendar-modal"
        overlayClassName="calendar-modal-overlay"
      >
        <h2>{selectedEvent?.title}</h2>
        <p>{selectedEvent?.description}</p>
        <p>
          <strong>Začiatok:</strong> {moment(selectedEvent?.start).format('LLLL')}
        </p>
        <p>
          <strong>Koniec:</strong> {moment(selectedEvent?.end).format('LLLL')}
        </p>
        <div className="modal-buttons">
          <button className="modal-btn join" onClick={handleJoinRequest}>
            Pripojiť sa
          </button>
          <button className="modal-btn close" onClick={() => setIsModalOpen(false)}>
            Zavrieť
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
