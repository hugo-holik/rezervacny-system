// import React, { useEffect, useState } from 'react';
// import { useGetAllExercisesQuery } from '@app/redux/api';
// import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// const localizer = momentLocalizer(moment);

// const Calendar = () => {
//   const { data: exercises, isLoading, isError } = useGetAllExercisesQuery();
//   const [events, setEvents] = useState([]);

//   // Mapovanie cviceni do kalendara
//   useEffect(() => {
//     // Kontrola ci su data dostupne
//     if (exercises) {
//       const mappedEvents = exercises.map(exercise => {
//         return exercise.startTimes.map(startTime => {
//           const startDate = moment(exercise._id).set({
//             hour: parseInt(startTime.split(':')[0]),
//             minute: parseInt(startTime.split(':')[1]),
//           });
//           const endDate = moment(startDate).add(exercise.duration, 'minutes');

//           return {
//             title: exercise.name,
//             start: startDate.toDate(),
//             end: endDate.toDate(),
//             allDay: false,
//             color: exercise.color || '#00bcd4',
//           };
//         });
//       }).flat();  // Flatten the array in case there are multiple start times per exercise

//       setEvents(mappedEvents);
//     }
//   }, [exercises]);

//   if (isLoading) return <div>Načítavanie...</div>;
//   if (isError) return <div>Error lnačítavania</div>;

//   //Zobrazenie kalendara cez big-calendar
//   return (
//     <div style={{ height: '100vh' }}>
//       <BigCalendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         style={{ height: '100%' }}
//         views={['month', 'week', 'day']}

//         eventPropGetter={(event) => ({
//           style: {
//             backgroundColor: event.color,
//           }
//         })}
//       />
//     </div>
//   );
// };

// /*
// const Calendar = () => {
//   return <div>Calendar</div>;
// };
// */

// export default Calendar;

const Calendar = () => {
  return <div>Calendar</div>;
};

export default Calendar;
