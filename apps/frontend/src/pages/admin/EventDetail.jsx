'use client';

import ConfirmationDialog from '@app/components/ConfirmationDialog';
import {
  useDeleteEventExerciseMutation,
  useEditEventExerciseMutation,
  useGetEventByIdQuery,
  useGetUserMeQuery,
  useSendApplicationMutation
} from '@app/redux/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};
const formatDateFavourite = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};


const formatTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EventDetail = () => {
  const { data: currentUser } = useGetUserMeQuery(); // Add this line to get current user
  const isPrivileged = currentUser?.role === "Správca cvičení" || currentUser?.isAdmin;

  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, refetch: refetchEvent } = useGetEventByIdQuery({ Id: eventId });
  const [deleteEventExercise] = useDeleteEventExerciseMutation();
  const [sendApplication] = useSendApplicationMutation();
  const [editEventExercise] = useEditEventExerciseMutation();

  // State for application dialog
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [numOfAttendees, setNumOfAttendees] = useState(1);

  if (isLoading || !event) {
    return <div>Načítavam detail udalosti...</div>;
  }

  //štatistiky
  const numberOfOpenExercises = event.openExercises?.length || 0;
  const numberOfApplications = event.openExercises?.reduce(
    (acc, exercise) => acc + (exercise.attendees?.length || 0),
    0
  );
  const numberOfInterestedAttendees = event.openExercises?.reduce(
    (acc, exercise) =>
      acc +
      (exercise.attendees?.reduce((a, attendee) => a + (attendee.numOfAttendees || 0), 0) || 0),
    0
  );

  // Najžiadanejšie cvičenie podľa počtu prihlášok
  const mostPopularExercise = event.openExercises?.reduce((max, exercise) => {
    const attendeesCount = exercise.attendees?.length || 0;
    if (!max || attendeesCount > (max.attendees?.length || 0)) {
      return exercise;
    }
    return max;
  }, null);


  const handleDeleteExercise = async (exerciseId) => {
    try {
      await deleteEventExercise({ eventId, exerciseId }).unwrap();
      toast.success('Cvičenie bolo úspešne odstránené');
    } catch (error) {
      toast.error('Chyba pri odstraňovaní cvičenia');
      console.error('Delete error:', error);
    }
  };

  const handleOpenApplicationDialog = (exercise) => {
    setSelectedExercise(exercise);
    setOpenApplicationDialog(true);
  };

  const handleCloseApplicationDialog = () => {
    setOpenApplicationDialog(false);
    setSelectedExercise(null);
    setNumOfAttendees(1);
  };

  const handleSubmitApplication = async () => {
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
        numOfAttendees: Number.parseInt(numOfAttendees)
      }).unwrap();
      toast.success('Prihlásenie bolo úspešné');
      handleCloseApplicationDialog();
    } catch (error) {
      toast.error('Chyba pri prihlasovaní');
      console.error('Application error:', error);
    }
  };

  const handleApproveExercise = async (exerciseId) => {
    try {
      await editEventExercise({
        eventId,
        exerciseId,
        status: 'schválené'
      }).unwrap();
      toast.success('Cvičenie bolo úspešne schválené');
    } catch (error) {
      toast.error('Chyba pri schvaľovaní cvičenia');
      console.error('Approve error:', error);
    }
  };
  const columns = [
    {
      field: 'exerciseName',
      headerName: 'Názov cvičenia',
      flex: 1,
      minWidth: 150,
      cellClassName: 'vertical-align-center'
    },
    {
      field: 'date',
      headerName: 'Dátum',
      flex: 1,
      valueFormatter: (params) => formatDate(params),
      cellClassName: 'vertical-align-center'
    },
    {
      field: 'startTime',
      headerName: 'Čas začiatku',
      flex: 1,
      cellClassName: 'vertical-align-center'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellClassName: 'vertical-align-center'
    },
    {
      field: 'note',
      headerName: 'Poznámka',
      flex: 1,
      valueFormatter: (params) => params || '-',
      cellClassName: 'vertical-align-center'
    },
    {
      field: 'actions',
      headerName: 'Akcie',
      width: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const isPrivileged = ['Správca cvičení'].includes(currentUser.role) || currentUser.isAdmin;
        const isPendingApproval = params.row.status === 'čaká na schválenie';

        return (
          <Box display="flex" gap={1}>
            <Tooltip title="Prihlásiť sa">
              <IconButton color="default" onClick={() => handleOpenApplicationDialog(params.row)}>
                <HowToRegIcon />
              </IconButton>
            </Tooltip>
            {isPrivileged && isPendingApproval && (
              <Tooltip title="Potvrdiť otvorené cvičenie">
                <IconButton color="default" onClick={() => handleApproveExercise(params.row._id)}>
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
            )}
            {isPrivileged && (
              <ConfirmationDialog
                title={`Naozaj chcete odstrániť cvičenie ${params.row.exerciseName}?`}
                onAccept={() => handleDeleteExercise(params.row._id)}
              >
                <Tooltip title="Odstrániť cvičenie">
                  <IconButton color="default">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ConfirmationDialog>
            )}
          </Box>
        );
      },
      cellClassName: 'vertical-align-center'
    }
  ];

  if (isLoading) {
    return (
      <Typography variant="h6" p={2}>
        Načítavam údaje o udalosti...
      </Typography>
    );
  }

  if (!event) {
    return (
      <Typography variant="h6" color="error" p={2}>
        Udalosť sa nenašla.
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Späť
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {event.name}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Dátum od:</strong> {formatDate(event.datefrom)}
            </Typography>
            <Typography variant="body1">
              <strong>Dátum do:</strong> {formatDate(event.dateto)}
            </Typography>
            <Typography variant="body1">
              <strong>Deadline na prihlásenie:</strong> {formatDate(event.dateClosing)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Status:</strong> {event.published ? 'Publikované' : 'Nepublikované'}
            </Typography>
            <Typography variant="body1">
              <strong>Počet cvičení:</strong> {event.openExercises ? event.openExercises.length : 0}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* DataGrid for open exercises */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Otvorené cvičenia
        </Typography>
        {event.openExercises && event.openExercises.length > 0 ? (
          <Box
            sx={{
              '& .vertical-align-center': {
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              },
              '& .MuiDataGrid-cell': {
                py: 2
              }
            }}
          >
            <DataGrid
              rows={event.openExercises}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 20, 50]}
              initialState={{
                density: 'compact',
                pagination: {
                  paginationModel: {
                    pageSize: 10
                  }
                }
              }}
              slots={{
                toolbar: GridToolbar
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true
                }
              }}
              ignoreDiacritics
              disableRowSelectionOnClick
              disableColumnSelector
              disableDensitySelector
            />
          </Box>
        ) : (
          <Typography variant="body1">Cvičenia ešte neboli pridané.</Typography>
        )}
      </Paper>

      {/* Application Dialog */}
      <Dialog open={openApplicationDialog} onClose={handleCloseApplicationDialog}>
        <DialogTitle>Prihlásenie na cvičenie</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Cvičenie:</strong> {selectedExercise?.exerciseName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Dátum:</strong> {selectedExercise && formatDate(selectedExercise.date)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Čas:</strong> {selectedExercise?.startTime}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Maximálny počet učastnikov:</strong> {selectedExercise?.exercise.maxAttendees}
            </Typography>
            <TextField
              label="Počet účastníkov"
              type="number"
              fullWidth
              margin="normal"
              value={numOfAttendees}
              onChange={(e) => setNumOfAttendees(e.target.value)}
              inputProps={{ 
                min: 1 ,
                max: selectedExercise?.exercise.maxAttendees || undefined
                }}
                error = {
                  !!numOfAttendees && Number(numOfAttendees) > selectedExercise?.exercise.maxAttendees
                }
                helperText={
                  !!numOfAttendees && Number(numOfAttendees) > selectedExercise?.exercise.maxAttendees
                    ?`Maximálny počet účastníkov je ${selectedExercise.exercise.maxAttendees}`
                    : ''
                }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplicationDialog}>Zrušiť</Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={!numOfAttendees || numOfAttendees < 1 || Number(numOfAttendees) > selectedExercise?.exercise.maxAttendees}
          >
            Potvrdiť
          </Button>
        </DialogActions>
      </Dialog>

      {isPrivileged && (
        <Box
          sx={{
            mt: 3,
            mb: 3,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {/* Každá kartička */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Otvorené cvičenia
              </Typography>
              <Typography variant="h5">{numberOfOpenExercises}</Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Počet prihlášok
              </Typography>
              <Typography variant="h5">{numberOfApplications}</Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Záujemcovia (účastníci)
              </Typography>
              <Typography variant="h5">{numberOfInterestedAttendees}</Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Najžiadanejšie cvičenie
              </Typography>
              {mostPopularExercise ? (
                <>
                  <Typography variant="body1" fontWeight="bold">
                    {mostPopularExercise.exerciseName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatDateFavourite(mostPopularExercise.date)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Žiadne cvičenie
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>   
  );
};

export default EventDetail;
