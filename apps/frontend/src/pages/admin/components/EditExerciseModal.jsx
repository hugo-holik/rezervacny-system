import { useEditExerciseMutation, useGetUsersListQuery } from '@app/redux/api';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const EditExerciseModal = ({ open, onClose, exerciseData }) => {
  const [editExercise] = useEditExerciseMutation();
  const { data: users } = useGetUsersListQuery();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState('');
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [color, setColor] = useState('');
  const [leads, setLeads] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Format date to 'HH:mm DD.MM.YYYY'
  const formatDateTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}.${month}.${year}`;
  };

  useEffect(() => {
    if (open && exerciseData) {
      setName(exerciseData.name);
      setDescription(exerciseData.description);
      setProgram(exerciseData.program);
      setRoom(exerciseData.room);
      setDuration(exerciseData.duration);
      setMaxAttendees(exerciseData.maxAttendees);
      setColor(exerciseData.color);
      setLeads(exerciseData.leads || []);

      // Format startTime correctly if available
      if (exerciseData.startTimes && exerciseData.startTimes[0]) {
        const startDate = new Date(exerciseData.startTimes[0]);
        setStartTime(formatDateTime(startDate));
      }
    }
  }, [open, exerciseData]);

  const validateFields = () => {
    const errors = {};
    if (!name) errors.name = 'validation.empty_name';
    if (!program) errors.program = 'validation.empty_program';
    if (!description) errors.description = 'validation.empty_description';
    if (!room) errors.room = 'validation.empty_room';
    if (!duration) errors.duration = 'validation.empty_duration';
    if (!maxAttendees) errors.maxAttendees = 'validation.maxAttendees';
    if (!startTime) errors.startTime = 'validation.empty_startTime';
    if (leads.length === 0) errors.leads = 'validation.empty_leads';
    if (
      errors.name ||
      errors.program ||
      errors.description ||
      errors.room ||
      errors.duration ||
      errors.maxAttendees ||
      errors.startTime
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

    // Convert the start time to a Date object from 'HH:mm DD.MM.YYYY'
    const [timeStr, dateStr] = startTime.split(' ');
    const [hours, minutes] = timeStr.split(':');
    const [day, month, year] = dateStr.split('.');
    const currentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const exerciseDataToSubmit = {
      name,
      description,
      program,
      room,
      duration: parseInt(duration),
      maxAttendees: parseInt(maxAttendees),
      color,
      leads,
      startTimes: [currentDate.toISOString()]
    };

    try {
      await editExercise({ Id: exerciseData._id, ...exerciseDataToSubmit }).unwrap();
      onClose();
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
            label="Začiatok (HH:mm DD.MM.YYYY)"
            type="text"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            margin="normal"
            error={!!validationErrors.startTime}
            helperText={
              validationErrors.startTime &&
              'Začiatok je povinný a musí byť v formáte HH:mm DD.MM.YYYY'
            }
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

          {/* Leads (Vyučujúci) */}
          <FormControl fullWidth margin="normal" error={!!validationErrors.leads}>
            <InputLabel>Vyučujúci</InputLabel>
            <Select multiple value={leads} onChange={(e) => setLeads(e.target.value)} label="Leads">
              {users?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.leads && (
              <Typography color="error" variant="body2">
                {validationErrors.leads}
              </Typography>
            )}
          </FormControl>

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
          Upravit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add prop types validation
EditExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  exerciseData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    program: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    maxAttendees: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    leads: PropTypes.arrayOf(PropTypes.string).isRequired,
    startTimes: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

export default EditExerciseModal;
