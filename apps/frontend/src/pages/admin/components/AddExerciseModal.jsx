import { useCreateExerciseMutation, useGetUserMeQuery, useGetUsersListQuery } from '@app/redux/api';
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
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

const AddExerciseModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [createExercise] = useCreateExerciseMutation();

  const { data: currentUser, isLoading: isCurrentUserLoading, refetch: refetchcurrentUser } = useGetUserMeQuery();
  const shouldFetchUsers = currentUser?.role === 'Správca cvičení' || currentUser?.isAdmin;
  const { data: users = [], isLoading: usersLoading } = useGetUsersListQuery(undefined, {
    skip: !shouldFetchUsers,
  });
  // TODO: novy GET podla role 
  const unizaUsers = users.filter(user => user.role === 'Zamestnanec UNIZA');


  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState('');
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [color, setColor] = useState('#000000');
  const [leads, setLeads] = useState([]);

  // Tu newStartTime je dayjs objekt alebo null
  const [newStartTime, setNewStartTime] = useState(null);
  // startTimes je pole stringov "HH:mm"
  const [startTimes, setStartTimes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!name) errors.name = 'Názov je povinný';
    if (!program) errors.program = 'Program je povinný';
    if (!description) errors.description = 'Popis je povinný';
    if (!room) errors.room = 'Miestnosť je povinná';
    if (!duration) {
      errors.duration = 'Dĺžka je povinná';
    } else if (!Number.isInteger(Number(duration)) || Number(duration) <= 0) {
      errors.duration = 'Dĺžka musí byť celé kladné číslo v hodinách';
    }
    if (!maxAttendees) errors.maxAttendees = 'Maximálny počet je povinný';
    if (startTimes.length === 0) errors.startTime = 'Aspoň jeden začiatok je povinný';
    if (leads.length === 0) errors.leads = 'Vyberte aspoň jedného vedúceho';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isWithinWorkingHoursWithDuration = (startTime, durationInHours) => {
    if (!startTime || !durationInHours) return false;

    const durationNum = Number(durationInHours);
    if (isNaN(durationNum) || durationNum <= 0) return false;

    const startHour = startTime.hour();
    const startMinutes = startTime.minute();

    const startTotalMinutes = startHour * 60 + startMinutes;
    const durationInMinutes = durationNum * 60;
    const endTotalMinutes = startTotalMinutes + durationInMinutes;

    const WORK_START = 8 * 60;         // 08:00
    const WORK_START_LIMIT = 17 * 60;  // 17:00
    const WORK_END = 18 * 60;          // 18:00

    if (startTotalMinutes < WORK_START || startTotalMinutes > WORK_START_LIMIT) return false;
    if (endTotalMinutes > WORK_END) return false;

    return true;
  };

  const handleAddStartTime = () => {
    setValidationErrors({});

    if (!newStartTime || !duration) {
      setValidationErrors({
        startTime: 'Zadajte čas a dĺžku cvičenia'
      });
      return;
    }

    if (!isWithinWorkingHoursWithDuration(newStartTime, duration)) {
      setValidationErrors({
        startTime: 'Cvičenie musí začať medzi 07:00 a 19:00 a skončiť najneskôr o 20:00'
      });
      return;
    }

    const timeString = newStartTime.format('HH:mm');

    if (startTimes.includes(timeString)) {
      setValidationErrors({
        startTime: 'Tento čas už bol pridaný'
      });
      return;
    }

    setStartTimes(prev => [...prev, timeString]);
    setNewStartTime(null);
    setValidationErrors({});
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
      startTimes
    };
    try {
      await createExercise(exerciseData).unwrap();
      onClose();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  useEffect(() => {
    if (!isCurrentUserLoading) {
      if (currentUser?.role === 'Zamestnanec UNIZA') {
        if (currentUser._id) {
          setLeads([currentUser._id]);
        } else {
          console.warn('Missing _id for user, refetching...');
          refetchcurrentUser();
        }
      }
    }
  }, [isCurrentUserLoading, currentUser, refetchcurrentUser]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 24, pb: 0 }}>Pridať cvičenie</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Názov"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
              <TextField
                label="Program"
                fullWidth
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                error={!!validationErrors.program}
                helperText={validationErrors.program}
              />
            </Stack>

            <TextField
              label="Popis"
              fullWidth
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Miestnosť"
                fullWidth
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                error={!!validationErrors.room}
                helperText={validationErrors.room}
              />
              <TextField
                label="Dĺžka (hodiny)"
                fullWidth
                type="number"
                inputProps={{ step: 1, min: 1 }}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                error={!!validationErrors.duration}
                helperText={validationErrors.duration}
              />
              <TextField
                label="Max. účastníkov"
                fullWidth
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                error={!!validationErrors.maxAttendees}
                helperText={validationErrors.maxAttendees}
              />
            </Stack>

            {!isCurrentUserLoading && currentUser?.role === 'Zamestnanec UNIZA' ? (
              <TextField
                label="Vyučujúci"
                fullWidth
                value={currentUser.name}
                disabled
                helperText="Ako zamestnanec UNIZA ste automaticky nastavený ako vyučujúci."
              />
            ) : (
              <FormControl fullWidth error={!!validationErrors.leads}>
                <InputLabel>Vyučujúci</InputLabel>
                <Select
                  multiple
                  value={leads}
                  onChange={(e) => setLeads(e.target.value)}
                  label="Vyučujúci"
                  disabled={usersLoading}
                >
                  {!usersLoading && unizaUsers.length > 0 ? (
                    unizaUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Žiadni vyučujúci nie sú dostupní</MenuItem>
                  )}
                </Select>
                {validationErrors.leads && (
                  <Typography color="error" variant="caption">
                    {validationErrors.leads}
                  </Typography>
                )}
              </FormControl>
            )}

            <Stack direction="row" spacing={4} alignItems="flex-start">
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Časy začiatku
                </Typography>
                <Stack direction="row" spacing={2} mt={1} alignItems="center">
                  <TimePicker
                    label="Nový začiatok"
                    value={newStartTime}
                    onChange={(newValue) => {
                      if (newValue && newValue.isValid()) {
                        setNewStartTime(newValue);
                        setValidationErrors((prev) => ({ ...prev, startTime: undefined }));
                      } else {
                        setNewStartTime(null);
                      }
                    }}
                    ampm={false}
                    minutesStep={60}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!validationErrors.startTime,
                        helperText: validationErrors.startTime
                      }
                    }}
                  />

                  <Button
                    variant="contained"
                    sx={{ height: 54 }}
                    onClick={handleAddStartTime}
                  >
                    Pridať
                  </Button>
                </Stack>

                <Stack mt={1} spacing={1}>
                  {startTimes.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Žiadne začiatky zatiaľ pridané
                    </Typography>
                  )}
                  {startTimes.map((time, idx) => (
                    <Stack
                      key={time}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1,
                        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                        borderRadius: 1,
                      }}
                    >
                      <Typography>{time}</Typography>
                      <IconButton size="small" onClick={() => handleRemoveStartTime(idx)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Farba
                </Typography>
                <SketchPicker
                  color={color}
                  onChangeComplete={(color) => setColor(color.hex)}
                />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Zrušiť
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Pridať cvičenie
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

AddExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddExerciseModal;
