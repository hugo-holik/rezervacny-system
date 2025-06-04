import { useGetAllEventsQuery, useGetAllExercisesQuery } from '@app/redux/api';
import moment from 'moment';
import 'moment/locale/sk'; // Import Slovak locale
import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import './CalendarCustom.css';
import ApplicationModal from './components/ApplicationModal';

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
  const {
    data: exercises,
    isLoading: isExercisesLoading,
    isError: isExercisesError
  } = useGetAllExercisesQuery();
  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError
  } = useGetAllEventsQuery();

  const [combinedEvents, setCombinedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const navigate = useNavigate();

  /*
  useEffect(() => {
  if (events) {
    // Mapni eventy (len publikované)
    const mappedEvents = events
      .filter(event => event.published)
      .map((event) => {
        const start = moment(event.datefrom);
        const end = moment(event.dateto);
        return {
          _id: event._id,
          title: event.name,
          start: start.toDate(),
          end: end.toDate(),
          allDay: false,
          color: '#4caf50',
          type: 'event',
          description: '',
        };
      });

    // Mapni cvičenia z event.openExercises všetkých publikovaných eventov
    const mappedExercises = events
      .filter(event => event.published && event.openExercises && event.openExercises.length > 0)
      .flatMap(event => 
        event.openExercises.map(openExercise => {
          const startMoment = moment(openExercise.date);
          const durationHours = openExercise.exercise?.duration;
          console.log("durationHours", durationHours);
          const endMoment = startMoment.clone().add(durationHours, 'hours');

          return {
            _id: openExercise._id,
            title: openExercise.name,
            start: startMoment.toDate(),
            end: endMoment.toDate(),
            allDay: false,
            color: openExercise.color || '#2196f3',
            type: 'exercise',
            description: openExercise.note || '',
            attendeesCount: openExercise.attendees.length
          };
        })
      );

    setCombinedEvents([...mappedEvents, ...mappedExercises]);
  }
}, [events]);
*/

  //Len cvicenia
  useEffect(() => {
    if (events && exercises) {
      // Build a map of exerciseId -> color
      const exerciseColorMap = {};
      exercises.forEach((ex) => {
        exerciseColorMap[ex._id] = ex.color;
      });

      const mappedExercises = events
        .filter((event) => event.published && event.openExercises && event.openExercises.length > 0)
        .flatMap((event) =>
          event.openExercises.map((openExercise) => {
            const startMoment = moment(openExercise.date);
            const durationHours = openExercise.exercise?.duration || 1;
            const endMoment = startMoment.clone().add(durationHours, 'hours');
            // Try to get color from exerciseColorMap using exercise._id
            const exerciseId =
              openExercise.exercise?._id || openExercise.exerciseId || openExercise._id;
            const color = exerciseColorMap[exerciseId] || openExercise.color || '#2196f3';

            return {
              _id: openExercise._id.$oid || openExercise._id,
              eventId: event._id.$oid || event._id,
              title: openExercise.exerciseName || openExercise.name,
              start: startMoment.toDate(),
              end: endMoment.toDate(),
              allDay: false,
              color,
              type: 'exercise',
              description: openExercise.note || '',
              attendeesCount: openExercise.attendees.length,
              exerciseName: openExercise.exerciseName,
              date: openExercise.date ? moment(openExercise.date).format('DD.MM.YYYY') : '',
              startTime: openExercise.startTime,
              exercise: {
                maxAttendees: openExercise.exercise?.maxAttendees || 20
              }
            };
          })
        );

      setCombinedEvents(mappedExercises);
    }
  }, [events, exercises]);

  if (isExercisesLoading || isEventsLoading) return <div>Načítavanie...</div>;
  if (isExercisesError || isEventsError) return <div>Chyba načítavania</div>;

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleGoToDetails = () => {
    if (selectedEvent && selectedEvent._id) {
      navigate(`/events/${selectedEvent.eventId}`);
    } else {
      console.warn('ID udalosti nie je dostupné.');
    }
  };
  const CustomEvent = ({ event }) => (
    <span
      style={{
        fontSize: '0.75rem',
        fontWeight: 500,
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'initial',
        display: 'block'
      }}
    >
      {event.title}
    </span>
  );

  const minTime = new Date();
  minTime.setHours(8, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(19, 0, 0, 0);

  return (
    <div className={`calendar-wrapper ${isModalOpen ? 'modal-open' : ''}`}>
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
          culture="sk"
          components={{
            event: CustomEvent
          }}
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
          min={minTime}
          max={maxTime}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        className="calendar-modal"
        overlayClassName="calendar-modal-overlay"
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header with colored indicator and title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor:
                  selectedEvent?.color || (selectedEvent?.published ? '#4caf50' : '#f44336'),
                borderRadius: '6px',
                marginRight: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#333'
              }}
            >
              {selectedEvent?.title}
            </h2>
          </div>

          {/* Main content area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}
          >
            {/* Left column - Primary information */}
            <div>
              {/* Description */}
              {selectedEvent?.description && (
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Popis
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9375rem',
                      lineHeight: '1.5',
                      color: '#444'
                    }}
                  >
                    {selectedEvent?.description}
                  </p>
                </div>
              )}

              {/* Time information */}
              <div style={{ marginBottom: '20px' }}>
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Časový rozvrh
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Začiatok
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {moment(selectedEvent?.start).format('LLL')}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Koniec
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {moment(selectedEvent?.end).format('LLL')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '16px'
                }}
              >
                {selectedEvent?.program && (
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Program
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {selectedEvent?.program}
                    </p>
                  </div>
                )}
                {selectedEvent?.room && (
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Miestnosť
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {selectedEvent?.room}
                    </p>
                  </div>
                )}
                {selectedEvent?.duration && (
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Dĺžka
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {selectedEvent?.duration} min
                    </p>
                  </div>
                )}
                {selectedEvent?.maxAttendees && (
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Kapacita
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {selectedEvent?.maxAttendees}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Secondary information */}
            <div>
              {/* Instructors */}
              {selectedEvent?.leads?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Vyučujúci ({selectedEvent.leads.length})
                  </h3>
                  <div
                    style={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    {selectedEvent.leads.map((leadId) => (
                      <div
                        key={leadId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            fontWeight: 600,
                            color: '#555',
                            fontSize: '0.875rem'
                          }}
                        >
                          {leadId.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: '0 0 2px 0',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#333'
                            }}
                          >
                            {/* Replace with actual name */}
                            Profesor {leadId.substring(0, 4)}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              color: '#888'
                            }}
                          >
                            ID: {leadId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#666',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Metadáta
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Vytvorené
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      {moment(selectedEvent?.createdAt).format('LL')}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#888'
                      }}
                    >
                      Farba udalosti
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: selectedEvent?.color,
                          borderRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      />
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#333'
                        }}
                      >
                        {selectedEvent?.color}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f0f0f0'
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.875rem',
                backgroundColor: '#f5f5f5',
                color: '#555',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              Zavrieť
            </button>
            <button
              onClick={handleGoToDetails}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.875rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#3d8b40'
                }
              }}
            >
              Prejsť na detaily
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedExercise(selectedEvent);
                setIsApplicationModalOpen(true);
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.875rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: '#3d8b40'
                }
              }}
            >
              Prihlásiť sa na cvicenie
            </button>
          </div>
        </div>
      </Modal>
      <ApplicationModal
        open={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        selectedExercise={selectedExercise}
        eventId={selectedEvent?.eventId} // ak potrebuješ
        onSuccess={() => {
          // napr. reload dát alebo ďalšia logika
          setIsApplicationModalOpen(false);
        }}
      />
    </div>
  );
};

export default Calendar;
