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
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AddExerciseToEventModal = ({ open, onClose, eventData }) => {
  const [date, setDate] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [note, setNote] = useState('');
  const [addEventExercise] = useAddEventExerciseMutation();
  const { data: exercises = [] } = useGetAllExercisesQuery();
  const { data: events = [] } = useGetAllEventsQuery();

  if (!eventData) return null;

  const eventStart = new Date(eventData.datefrom);
  const eventEnd = new Date(eventData.dateto);
  eventEnd.setHours(23, 59, 59, 999);

  const filteredExercises = exercises.filter((exercise) => {
    const rawDate = exercise.startTimes?.[0];
    if (!rawDate) return false;

    const exerciseDate = new Date(rawDate);
    const isValid = !isNaN(exerciseDate);

    if (!isValid) {
      console.warn('Neplatný dátum cvičenia:', exercise);
      return false;
    }

    return exerciseDate >= eventStart && exerciseDate <= eventEnd;
  });

  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = async () => {
    try {
      const allEvents = events || [];
      const selectedEvent = allEvents.find((e) => e._id === eventData._id);
      if (!selectedEvent) throw new Error('Event not found');

      const selectedExercise = exercises.find((e) => e._id === exerciseId);
      if (!selectedExercise) throw new Error('Exercise not found');

      const newExercise = {
        date,
        startTime: selectedExercise.startTimes[0], // ✅ just one string
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

      await addEventExercise({ Id: selectedEvent._id, ...newExercise }).unwrap();

      onClose();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Pridaj otvorené cvičenie</DialogTitle>
        <DialogContent>
          <DatePicker
            sx={{
              marginTop: 2,
              width: '100%',
              '& .MuiInputBase-root': {
                height: '56px' // Match standard TextField height
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)' // Match default border
              }
            }}
            label="Dátum"
            value={date ? dayjs(date) : null}
            onChange={(newValue) => setDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            )}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="exercise-select-label">Vyber cvičenie</InputLabel>
            <Select
              labelId="exercise-select-label"
              value={exerciseId}
              label="Vyber cvičenie"
              onChange={(e) => setExerciseId(e.target.value)}
            >
              {filteredExercises.length === 0 ? (
                <MenuItem disabled>Žiadne cvičenia v tomto dátume</MenuItem>
              ) : (
                filteredExercises.map((exercise) => (
                  <MenuItem key={exercise._id} value={exercise._id}>
                    {exercise.name} – {formatDateTime(exercise.startTimes?.[0])}
                  </MenuItem>
                ))
              )}
            </Select>
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
          <Button onClick={handleSubmit} variant="contained">
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
