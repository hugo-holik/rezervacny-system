import { useEditExerciseMutation } from '@app/redux/api';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types'; // Import prop-types
import { useEffect, useState } from 'react';

const EditExerciseModal = ({ open, onClose, exerciseData }) => {
  const [editExercise] = useEditExerciseMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState('');
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (open && exerciseData) {
      setName(exerciseData.name);
      setDescription(exerciseData.description);
      setProgram(exerciseData.program);
      setRoom(exerciseData.room);
      setDuration(exerciseData.duration);
      setMaxAttendees(exerciseData.maxAttendees);
      setColor(exerciseData.color);
    }
  }, [open, exerciseData]);

  const handleSubmit = async () => {
    const updatedData = {
      name,
      description,
      program,
      room,
      duration: parseInt(duration),
      maxAttendees: parseInt(maxAttendees),
      color
    };
    console.log('Updated exercise data:', updatedData); // Log the data to be sent
    try {
      await editExercise({ Id: exerciseData._id, ...updatedData }).unwrap();
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error('Error editing exercise:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upravit cvičenie</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '400px' }}>
          <TextField
            label="Názov"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Popis"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Program"
            fullWidth
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Miestnosť"
            fullWidth
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Dĺžka (min)"
            fullWidth
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Maximálny počet účastníkov"
            fullWidth
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Farba"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button onClick={handleSubmit} color="primary">
          Upravit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add prop types validation
EditExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired, // Ensuring open is a boolean
  onClose: PropTypes.func.isRequired, // Ensuring onClose is a function
  exerciseData: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Ensuring _id is a string
    name: PropTypes.string.isRequired, // Ensuring name is a string
    description: PropTypes.string.isRequired, // Ensuring description is a string
    program: PropTypes.string.isRequired, // Ensuring program is a string
    room: PropTypes.string.isRequired, // Ensuring room is a string
    duration: PropTypes.number.isRequired, // Ensuring duration is a number
    maxAttendees: PropTypes.number.isRequired, // Ensuring maxAttendees is a number
    color: PropTypes.string.isRequired // Ensuring color is a string
  }).isRequired
};

export default EditExerciseModal;
