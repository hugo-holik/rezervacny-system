import { useCreateExerciseMutation, useGetUsersListQuery } from '@app/redux/api';
import { Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
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
  const [newStartTime, setNewStartTime] = useState(null);
  const [startTimes, setStartTimes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!name) errors.name = 'validation.empty_name';
    if (!program) errors.program = 'validation.empty_program';
    if (!description) errors.description = 'validation.empty_description';
    if (!room) errors.room = 'validation.empty_room';
    if (!duration) errors.duration = 'validation.empty_duration';
    if (!maxAttendees) errors.maxAttendees = 'validation.maxAttendees';
    if (startTimes.length === 0) errors.startTime = 'validation.empty_startTime';
    if (leads.length === 0) errors.leads = 'validation.empty_leads';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStartTime = () => {
    if (newStartTime) {
      setStartTimes([...startTimes, newStartTime.toDate()]);
      setNewStartTime(null);
    }
  };

  const handleRemoveStartTime = (indexToRemove) => {
    setStartTimes(startTimes.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const exerciseData = {
      name,
      description,
      program,
      room,
      duration: parseInt(duration),
      maxAttendees: parseInt(maxAttendees),
      color,
      leads,
      startTimes: startTimes.map((time) => time.toISOString())
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

            {/* Add Start Times */}
            <Stack direction="row" spacing={1} alignItems="center" marginTop={2}>
              <DateTimePicker
                label="Pridať začiatok"
                value={newStartTime}
                onChange={setNewStartTime}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validationErrors.startTime,
                    helperText: validationErrors.startTime && 'Aspoň jeden začiatok je povinný'
                  }
                }}
              />
              <Button onClick={handleAddStartTime} variant="contained">
                Pridať
              </Button>
            </Stack>

            {startTimes.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2">Začiatky:</Typography>
                {startTimes.map((time, index) => (
                  <Stack
                    direction="row"
                    key={index}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography>{dayjs(time).format('DD.MM.YYYY HH:mm')}</Typography>
                    <IconButton onClick={() => handleRemoveStartTime(index)} size="small">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            )}

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

            <TextField
              label="Farba"
              fullWidth
              value={color}
              onChange={(e) => setColor(e.target.value)}
              margin="normal"
            />
          </Box>

          {Object.keys(validationErrors).length > 0 && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
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
    </LocalizationProvider>
  );
};

AddExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddExerciseModal;
