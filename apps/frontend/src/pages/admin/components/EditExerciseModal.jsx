import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SketchPicker } from 'react-color';
import { toast } from 'react-toastify';
import { useEditExerciseMutation, useGetUserMeQuery,useGetUsersListQuery } from '@app/redux/api';

const EditExerciseModal = ({ open, onClose, exerciseData }) => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetUserMeQuery();
  const shouldFetchUsers = currentUser?.role === 'Správca cvičení' || currentUser?.isAdmin;

  const { data: users = [], isLoading: usersLoading } = useGetUsersListQuery(undefined, {
    skip: !shouldFetchUsers,
  });

  const unizaUsers = users.filter(user => user.role === 'Zamestnanec UNIZA');

  // Tu môžeš použiť unizaUsers napr. v selectoch, alebo kdekoľvek v UI

  if (isCurrentUserLoading || usersLoading) {
    return <div>Načítavam údaje...</div>;
  };

  const theme = useTheme();
  const [editExercise] = useEditExerciseMutation();

  // Stavy pre formulár
  const [name, setName] = useState(exerciseData?.name || '');
  const [description, setDescription] = useState(exerciseData?.description || '');
  const [program, setProgram] = useState(exerciseData?.program || '');
  const [room, setRoom] = useState(exerciseData?.room || '');
  const [duration, setDuration] = useState(exerciseData?.duration || '');
  const [maxAttendees, setMaxAttendees] = useState(exerciseData?.maxAttendees || '');
  const [color, setColor] = useState(exerciseData?.color || '#000000');
  const [leads, setLeads] = useState(exerciseData?.leads || []);
  const [newStartTime, setNewStartTime] = useState(null);
  const [startTimes, setStartTimes] = useState(exerciseData?.startTimes || []);
  const [validationErrors, setValidationErrors] = useState({});

  // Keby sa zmení exerciseData, naplní stavy nanovo
  useEffect(() => {
    if (exerciseData) {
      setName(exerciseData.name || '');
      setDescription(exerciseData.description || '');
      setProgram(exerciseData.program || '');
      setRoom(exerciseData.room || '');
      setDuration(exerciseData.duration || '');
      setMaxAttendees(exerciseData.maxAttendees || '');
      setColor(exerciseData.color || '#000000');
      setLeads(
        (exerciseData.leads || [])
          .map(lead =>
            typeof lead === 'string'
              ? lead
              : (lead?._id || lead?.$oid || '')
          )
          .filter(Boolean)
      );
      setStartTimes(exerciseData.startTimes || []);
    }
  }, [exerciseData]);

  // Validácia povinných polí
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

  // Validácia, či začiatok a dĺžka spadajú do pracovných hodín
  const isWithinWorkingHoursWithDuration = (startTimeString, durationInHours) => {
    if (!startTimeString || !durationInHours) return false;

    const durationNum = Number(durationInHours);
    if (isNaN(durationNum) || durationNum <= 0) return false;

    const startTime = dayjs(startTimeString, 'HH:mm');
    if (!startTime.isValid()) return false;

    const startTotalMinutes = startTime.hour() * 60 + startTime.minute();
    const durationInMinutes = durationNum * 60;
    const endTotalMinutes = startTotalMinutes + durationInMinutes;

    const WORK_START = 8 * 60;         // 08:00
    const WORK_START_LIMIT = 17 * 60;  // 17:00
    const WORK_END = 18 * 60;          // 18:00

    if (startTotalMinutes < WORK_START || startTotalMinutes > WORK_START_LIMIT) return false;
    if (endTotalMinutes > WORK_END) return false;

    return true;
  };

  // Pridanie nového času začiatku
  const handleAddStartTime = () => {
    setValidationErrors({});

    if (!newStartTime || !duration) {
      setValidationErrors({
        startTime: 'Zadajte čas a dĺžku cvičenia'
      });
      return;
    }

    const timeString = newStartTime.format('HH:mm');

    if (!isWithinWorkingHoursWithDuration(timeString, duration)) {
      setValidationErrors({
        startTime: 'Cvičenie musí začať medzi 08:00 a 17:00 a skončiť najneskôr o 18:00'
      });
      return;
    }

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

  // Odstránenie času začiatku
  const handleRemoveStartTime = (indexToRemove) => {
    setStartTimes(startTimes.filter((_, index) => index !== indexToRemove));
  };

  // Odoslanie formulára - editovanie cvičenia
  const handleSubmit = async () => {
    if (!validateFields()) return;

    const updatedExercise = {
      name,
      description,
      program,
      room,
      duration: parseInt(duration, 10),
      maxAttendees: parseInt(maxAttendees, 10),
      color,
      leads,
      startTimes, // pole stringov "HH:mm"
    };

    try {
      await editExercise({ id: exerciseData._id, ...updatedExercise }).unwrap();
      toast.success('Cvičenie bolo úspešne upravené');
      onClose(true);
    } catch (error) {
      toast.error('Chyba pri úprave cvičenia: ' + (error?.data?.message || 'Neznáma chyba'));
      console.error('Error editing exercise:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 24, pb: 0 }}>
          Upraviť cvičenie
        </DialogTitle>

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
                label="Dĺžka (hod)"
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
                {unizaUsers?.map((user) => (
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

            {/* Pridávanie času začiatku */}
            <Stack direction="row" spacing={2} alignItems="center">
              <DateTimePicker
                label="Nový čas začiatku"
                value={newStartTime}
                onChange={setNewStartTime}
                ampm={false}
                format="HH:mm"
                views={['hours', 'minutes']}
                sx={{ width: 160 }}
                slotProps={{
                  textField: { size: 'small' },
                }}
              />
              <Button variant="outlined" onClick={handleAddStartTime}>
                Pridať čas
              </Button>
            </Stack>
            {validationErrors.startTime && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                {validationErrors.startTime}
              </Typography>
            )}

            {/* Zobrazenie zoznamu časov */}
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
                      <Typography>{time}</Typography>
                      <IconButton
                        onClick={() => handleRemoveStartTime(index)}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Farba cvičenia
              </Typography>
              <SketchPicker
                color={color}
                onChangeComplete={(color) => setColor(color.hex)}
                disableAlpha
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => onClose(false)}>Zrušiť</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Uložiť zmeny
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

EditExerciseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  exerciseData: PropTypes.object.isRequired,
};

export default EditExerciseModal;
