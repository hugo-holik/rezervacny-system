import { useEditExerciseMutation } from '@app/redux/api'; // Assuming this mutation is for editing exercise
import { Delete } from '@mui/icons-material';
import { toast } from 'react-toastify'; // Add this import at the top

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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

const EditExerciseModal = ({ open, onClose, exerciseData, users }) => {
  const theme = useTheme();
  const [editExercise] = useEditExerciseMutation();

  // Initialize state from the passed exerciseData
  const [name, setName] = useState(exerciseData?.name || '');
  const [description, setDescription] = useState(exerciseData?.description || '');
  const [program, setProgram] = useState(exerciseData?.program || '');
  const [room, setRoom] = useState(exerciseData?.room || '');
  const [duration, setDuration] = useState(exerciseData?.duration || '');
  const [maxAttendees, setMaxAttendees] = useState(exerciseData?.maxAttendees || '');
  const [color, setColor] = useState(exerciseData?.color || '#000000');
  const [leads, setLeads] = useState(exerciseData?.leads || []);
  const [newStartTime, setNewStartTime] = useState(null);
  const [startTimes, setStartTimes] = useState(
    exerciseData?.startTimes ? exerciseData.startTimes.map((time) => dayjs(time)) : []
  );
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!name) errors.name = 'Názov je povinný';
    if (!program) errors.program = 'Program je povinný';
    if (!description) errors.description = 'Popis je povinný';
    if (!room) errors.room = 'Miestnosť je povinná';
    if (!duration) errors.duration = 'Dĺžka je povinná';
    if (!maxAttendees) errors.maxAttendees = 'Maximálny počet je povinný';
    if (startTimes.length === 0) errors.startTime = 'Aspoň jeden začiatok je povinný';
    if (leads.length === 0) errors.leads = 'Vyberte aspoň jedného vedúceho';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStartTime = () => {
    if (newStartTime) {
      setStartTimes([...startTimes, newStartTime]);
      setNewStartTime(null);
    }
  };

  const handleRemoveStartTime = (indexToRemove) => {
    setStartTimes(startTimes.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const updatedExercise = {
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

    try {
      await editExercise({ id: exerciseData._id, ...updatedExercise }).unwrap();
      toast.success('Cvičenie bolo úspešne upravené');
      onClose(true); // pass `true` to signal successful update
    } catch (error) {
      toast.error('Chyba pri úprave cvičenia: ' + error?.data?.message || 'Neznáma chyba');
      console.error('Error editing exercise:', error);
    }
  };

  useEffect(() => {
    if (exerciseData) {
      setName(exerciseData.name || '');
      setDescription(exerciseData.description || '');
      setProgram(exerciseData.program || '');
      setRoom(exerciseData.room || '');
      setDuration(exerciseData.duration || '');
      setMaxAttendees(exerciseData.maxAttendees || '');
      setColor(exerciseData.color || '#000000');
      setLeads(exerciseData.leads || []);
      setStartTimes(
        exerciseData.startTimes ? exerciseData.startTimes.map((time) => dayjs(time)) : []
      );
    }
  }, [exerciseData]); // Re-run when exerciseData changes

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 24, pb: 0 }}>Upraviť cvičenie</DialogTitle>
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
                label="Dĺžka (min)"
                fullWidth
                type="number"
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

            <FormControl fullWidth error={!!validationErrors.leads}>
              <InputLabel>Vyučujúci</InputLabel>
              <Select
                multiple
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
                label="Vyučujúci"
              >
                {users?.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.leads && (
                <Typography color="error" variant="caption">
                  {validationErrors.leads}
                </Typography>
              )}
            </FormControl>

            <Stack direction="row" spacing={4} alignItems="flex-start">
              {/* Start Times Section */}
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Časy začiatku
                </Typography>
                <Stack direction="row" spacing={2} mt={1} alignItems="center">
                  <DateTimePicker
                    label="Nový začiatok"
                    value={newStartTime}
                    onChange={setNewStartTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!validationErrors.startTime,
                        helperText: validationErrors.startTime
                      }
                    }}
                  />
                  <Button variant="contained" onClick={handleAddStartTime}>
                    Pridať
                  </Button>
                </Stack>

                {startTimes.length > 0 && (
                  <Box mt={2}>
                    <Stack spacing={1}>
                      {startTimes.map((time, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            bgcolor: theme.palette.action.hover,
                            px: 2,
                            py: 1,
                            borderRadius: 1
                          }}
                        >
                          <Typography>{dayjs(time).format('DD.MM.YYYY HH:mm')}</Typography>
                          <IconButton onClick={() => handleRemoveStartTime(index)} size="small">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Color Picker Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Vyberte farbu
                </Typography>
                <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Zrušiť
          </Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            Upravit cvičenie
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

EditExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  exerciseData: PropTypes.object.isRequired, // Accepting exerciseData as prop
  users: PropTypes.array.isRequired // Accepting users list as prop
};

export default EditExerciseModal;
