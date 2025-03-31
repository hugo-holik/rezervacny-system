import { useCreateExerciseMutation } from '@app/redux/api';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AddExerciseModal = ({ open, onClose }) => {
  const [createExercise] = useCreateExerciseMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState('');
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [color, setColor] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!name) errors.name = 'validation.empty_name';
    if (!program) errors.program = 'validation.empty_program';
    if (!description) errors.description = 'validation.empty_description';
    if (!room) errors.room = 'validation.empty_room';
    if (!duration) errors.duration = 'validation.empty_duration';
    if (!maxAttendees) errors.maxAttendees = 'validation.maxAttendees';
    // Leads and startTimes validation would depend on how they are handled in the backend
    // Assuming leads and startTimes are added later or can be empty for now
    if (
      errors.name ||
      errors.program ||
      errors.description ||
      errors.room ||
      errors.duration ||
      errors.maxAttendees
    ) {
      setValidationErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    const exerciseData = {
      name,
      description,
      program,
      room,
      duration: parseInt(duration),
      maxAttendees: parseInt(maxAttendees),
      color
    };
    console.log('Exercise data to be sent:', exerciseData); // Log the data to be sent
    try {
      await createExercise(exerciseData).unwrap();
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Pridať cvičenie</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '400px' }}>
          <TextField
            label="Názov"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            error={!!validationErrors.name}
            helperText={validationErrors.name && 'Názov je povinný'}
          />
          <TextField
            label="Popis"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            error={!!validationErrors.description}
            helperText={validationErrors.description && 'Popis je povinný'}
          />
          <TextField
            label="Program"
            fullWidth
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            margin="normal"
            error={!!validationErrors.program}
            helperText={validationErrors.program && 'Program je povinný'}
          />
          <TextField
            label="Miestnosť"
            fullWidth
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            margin="normal"
            error={!!validationErrors.room}
            helperText={validationErrors.room && 'Miestnosť je povinná'}
          />
          <TextField
            label="Dĺžka (min)"
            fullWidth
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            margin="normal"
            error={!!validationErrors.duration}
            helperText={validationErrors.duration && 'Dĺžka je povinná'}
          />
          <TextField
            label="Maximálny počet účastníkov"
            fullWidth
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            margin="normal"
            error={!!validationErrors.maxAttendees}
            helperText={validationErrors.maxAttendees && 'Maximálny počet účastníkov je povinný'}
          />
          <TextField
            label="Farba"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            margin="normal"
          />
        </Box>
        {Object.keys(validationErrors).length > 0 && (
          <Typography color="error" variant="body2">
            Prosím opravte všetky chyby pred odoslaním formulára.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button onClick={handleSubmit} color="primary">
          Pridať
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// PropTypes validation
AddExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddExerciseModal;
