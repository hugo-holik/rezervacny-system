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
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAddEventExerciseMutation, useGetAllExercisesQuery } from '@app/redux/api';

const AddExerciseToEventModal = ({ open, onClose, eventData }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [note, setNote] = useState('');
  const [addEventExercise] = useAddEventExerciseMutation();
  const { data: exercises = [] } = useGetAllExercisesQuery();

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
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = async () => {
    try {
      await addEventExercise({
        Id: eventData._id,
        date,
        startTime,
        exerciseId,
        note
      }).unwrap();

      onClose();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pridaj otvorené cvičenie</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Dátum"
          type="date"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField
          fullWidth
          label="Čas začiatku"
          type="time"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
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
