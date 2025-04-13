import { useCreateExerciseMutation, useGetUsersListQuery } from '@app/redux/api';
import {Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,TextField,Typography,FormControl,InputLabel,Select,MenuItem} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AddExerciseModal = ({ open, onClose }) => {
  const [createExercise] = useCreateExerciseMutation();
  const { data: users, isLoading: usersLoading } = useGetUsersListQuery();
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

    // Convert startTime string (HH:mm DD:mm:YYYY) to a Date object
    const [time, date] = startTime.split(' ');
    const [hours, minutes] = time.split(':');
    const [day, month, year] = date.split(':');

    const currentDate = new Date(year, month - 1, day, hours, minutes, 0, 0); // Set the date and time

    const exerciseData = {
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
    console.log('Exercise data to be sent:', exerciseData);
    try {
      await createExercise(exerciseData).unwrap();
      onClose();
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
          {/* Zaciatok cvicenia, treba zmenit na datepicker */}
          <TextField
            label="Začiatok (HH:mm DD:mm:YYYY)"
            type="text"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            margin="normal"
            error={!!validationErrors.startTime}
            helperText={validationErrors.startTime && 'Začiatok je povinný a musí byť v formáte HH:mm DD:mm:YYYY'}
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
          {/*----------------------------------------------- */}
          <FormControl fullWidth margin="normal" error={!!validationErrors.leads}>
            <InputLabel>Vyučujúci</InputLabel>
            <Select
              multiple
              value={leads}
              onChange={(e) => setLeads(e.target.value)}
              label="Leads"
              disabled={usersLoading}
            >
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

          {/* ---------------------------------------------- */}
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
