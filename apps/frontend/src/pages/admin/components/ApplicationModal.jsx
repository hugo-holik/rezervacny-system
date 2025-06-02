import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box
} from '@mui/material';
import { toast } from 'react-toastify';
import { useSendApplicationMutation } from '@app/redux/api';

const ApplicationModal = ({ open, onClose, selectedExercise, eventId, onSuccess }) => {
  const [numOfAttendees, setNumOfAttendees] = useState('');
  const [sendApplication, { isLoading }] = useSendApplicationMutation();

  useEffect(() => {
    if (!open) {
      setNumOfAttendees('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedExercise || !numOfAttendees) return;

    const maxAttendees = selectedExercise.exercise.maxAttendees;
    if (Number(numOfAttendees) > maxAttendees) {
      toast.error(`Maximálny počet účastníkov je ${maxAttendees}`);
      return;
    }

    try {
      await sendApplication({
        eventId,
        exerciseId: selectedExercise._id,
        numOfAttendees: Number(numOfAttendees)
      }).unwrap();

      toast.success('Prihlásenie bolo úspešné');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
            
       const errorMessage =
        error?.data?.message ||       // RTK Query error shape
        error?.error?.data?.message || // alternatívny tvar
        error?.message ||              // obyčajná JS chyba
        'Chyba pri prihlasovaní';


      toast.error(errorMessage);
      console.error('Application error:', error);
    }
  };

  if (!selectedExercise) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Prihlásenie na cvičenie</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, minWidth: 300 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Cvičenie:</strong> {selectedExercise.exerciseName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Dátum:</strong> {selectedExercise.date /* nebo použij formátovací funkci */}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Čas:</strong> {selectedExercise.startTime}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Maximálny počet účastníkov:</strong> {selectedExercise.exercise.maxAttendees}
          </Typography>
          <TextField
            label="Počet účastníkov"
            type="number"
            fullWidth
            margin="normal"
            value={numOfAttendees}
            onChange={(e) => setNumOfAttendees(e.target.value)}
            inputProps={{ 
              min: 1,
              max: selectedExercise.exercise.maxAttendees
            }}
            error={!!numOfAttendees && Number(numOfAttendees) > selectedExercise.exercise.maxAttendees}
            helperText={
              !!numOfAttendees && Number(numOfAttendees) > selectedExercise.exercise.maxAttendees
                ? `Maximálny počet účastníkov je ${selectedExercise.exercise.maxAttendees}`
                : ''
            }
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Zrušiť</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!numOfAttendees || Number(numOfAttendees) < 1 || Number(numOfAttendees) > selectedExercise.exercise.maxAttendees || isLoading}
        >
          Potvrdiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationModal;
