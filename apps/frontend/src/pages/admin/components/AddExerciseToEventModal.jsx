import {Dialog,DialogActions,DialogContent,DialogTitle,Button,TextField} from '@mui/material';
  import { useState } from 'react';
  import { useAddExerciseToEventMutation } from '@app/redux/api';
  
  const AddExerciseToEventModal = ({ open, onClose, eventData }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [exerciseId, setExerciseId] = useState('');
    const [note, setNote] = useState('');
    const [addExerciseToEvent] = useAddExerciseToEventMutation();
  
    const handleSubmit = async () => {
      try {
        await addExerciseToEvent({
          eventId: eventData._id,
          newExercise: {
            date,
            startTime,
            exercise: exerciseId,
            note
          }
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
          <TextField
            fullWidth
            label="ID cvičenia"
            margin="normal"
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
          />
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
          <Button onClick={handleSubmit} variant="contained">Pridať</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default AddExerciseToEventModal;
  