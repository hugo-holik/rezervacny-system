'use client';

import {
  useAddEventExerciseMutation,
  useGetAllEventsQuery,
  useGetAllExercisesQuery
} from '@app/redux/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Tooltip,
  Autocomplete,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

dayjs.extend(utc);
dayjs.extend(timezone);

const AddExerciseToEventModal = ({ open, onClose, eventData }) => {
  const [date, setDate] = useState(null);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [time, setTime] = useState('')
  const [note, setNote] = useState('');
  const [addEventExercise] = useAddEventExerciseMutation();
  const { data: exercises = [] } = useGetAllExercisesQuery();
  const { data: events = [] } = useGetAllEventsQuery();


   useEffect(() => {
    if (open) {
      setDate(null);
      setExerciseInput('');
      setNote('');
    }
  }, [open]);
  
  if (!eventData) return null;

  const eventStart = new Date(eventData.datefrom);
  const eventEnd = new Date(eventData.dateto);
  eventEnd.setHours(23, 59, 59, 999);

  // Convert to dayjs for the date picker
  const minDate = dayjs(eventData.datefrom);
  const maxDate = dayjs(eventData.dateto);

  //cvicenia
  const filteredExercises = exercises;
  //Filtrovanie cviceni podla textu v inpute 
  const filteredExercisesByName = filteredExercises.filter((exercise) =>
  exercise.name.toLowerCase().includes(exerciseInput.toLowerCase())
  );
  //Pole možností tak, že každý čas z cvičenia je jedna možnosť (kombinácia)
  const options = filteredExercisesByName.flatMap(exercise =>
    exercise.startTimes.map(time => ({
      label: `${exercise.name} – ${time} – ${exercise.room}`,
      exerciseId: exercise._id,
      time,
      name: exercise.name,
      room: exercise.room
    }))
  );
  // Vybrana Hodnota - objekt, alebo null
  const selectedExercise = exercises.find(e => e._id === exerciseId);
  const selectedOption = exerciseId && time ? {
    exerciseId,
    time,
    name: selectedExercise?.name,
    room: selectedExercise?.room,
    label: `${exercises.find(e => e._id === exerciseId)?.name} – ${time}`
  } : null;



  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = async () => {
    try {
      const allEvents = events || [];
      const selectedEvent = allEvents.find((e) => e._id === eventData._id);
      if (!selectedEvent) throw new Error('Event nenájdený');

      const selectedExercise = exercises.find((e) => e._id === exerciseId);
      if (!selectedExercise) throw new Error('cvičenie nenájdené');
      if (!time) throw new Error('Cvičenie nemá platný čas začiatku');

      const room = selectedExercise.room;
      const duration = selectedExercise.duration;
      //spajanie date a startTime
      const dateString = date.format('YYYY-MM-DD');
      const dateTimeString = `${dateString}T${time}:00`;
      const startDate = dayjs.tz(dateTimeString, 'Europe/Bratislava');
      const endDate = startDate.add(duration, 'hour'); 

      //kontrola ci existuje kolizia v cviceniach
      const allEventExercises = allEvents.flatMap(e => e.openExercises || []);
      const conflicting =allEventExercises.find((ex) => {
        if (ex.status !== 'schválené') return false;

        const existingStart = dayjs(ex.date);
        const existingEnd = existingStart.add(duration, 'hour');
        const sameRoom = exercises.find(e => e._id === ex.exercise)?.room === room;

        const overlaps = startDate.isBefore(existingEnd) && endDate.isAfter(existingStart);
        return sameRoom && overlaps;
      });

      if(conflicting){
        toast.error('V zadanom čase a miestnosti už existuje schválené cvičenie, ktoré sa prekrýva.');
        return;
      }

      const newExercise = {
        date: startDate,
        startTime: time,
        exercise: exerciseId,
        exerciseName: selectedExercise.name,
        attendees: [
          {
            teacher: selectedExercise.leads[0],
            numOfAttendees: selectedExercise.numOfAttendees,
            approvalStatus: 'pending',
            approvedAt: null
          }
        ],
        status: 'čaká na schválenie',
        note
      };

      const response = await addEventExercise({ Id: selectedEvent._id, ...newExercise }).unwrap();
      
      if (!response.error) {
           toast.success('Cvičenie bolo úspešne pridané.');
           onClose();
      }

    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error( error?.data?.error || 'Nastala chyba pri pridávaní cvičenia.');
    }
  };

  const isDateInRange = (date) => {
    if (!date) return true;
    const selectedDate = dayjs(date);
    return (
      (selectedDate.isAfter(minDate) || selectedDate.isSame(minDate, 'day')) &&
      (selectedDate.isBefore(maxDate) || selectedDate.isSame(maxDate, 'day'))
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Pridaj otvorené cvičenie</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 1 }}>
            Povolený rozsah dátumov: {dayjs(eventData.datefrom).format('DD.MM.YYYY')} -{' '}
            {dayjs(eventData.dateto).format('DD.MM.YYYY')}
          </Typography>
          <DatePicker
            sx={{
              marginTop: 1,
              width: '100%',
              '& .MuiInputBase-root': {
                height: '56px' // Match standard TextField height
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)' // Match default border
              }
            }}
            label="Dátum"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            minDate={minDate}
            maxDate={maxDate}
            shouldDisableDate={(date) => !isDateInRange(date)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            )}
          />
          <FormControl fullWidth margin="normal">
            <Tooltip title="Môžeš vyhladať podla názvu cvičenia">
              <Autocomplete
                options={options}
                getOptionLabel={(option) => `${option.name} – ${option.time} – ${option.room}`}
                value={selectedOption}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setExerciseId(newValue.exerciseId);
                    setTime(newValue.time);
                  } else {
                    setExerciseId('');
                    setTime('');
                  }
                }}
                inputValue={exerciseInput}
                onInputChange={(_, newInputValue) => setExerciseInput(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vyber cvičenie"
                    margin="normal"
                    fullWidth
                  />
                )}
              />
            </Tooltip>
          </FormControl>

          <TextField
            fullWidth
            label="Poznámka"
            margin="normal"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Zrušiť</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!date || !exerciseId || !isDateInRange(date)}
          >
            Pridať
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

AddExerciseToEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    datefrom: PropTypes.string.isRequired,
    dateto: PropTypes.string.isRequired
  })
};

export default AddExerciseToEventModal;
