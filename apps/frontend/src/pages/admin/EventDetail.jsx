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
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EventDetail = () => {
  const { data: currentUser } = useGetUserMeQuery(); // Add this line to get current user

  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEventByIdQuery({ Id: eventId });
  const [deleteEventExercise] = useDeleteEventExerciseMutation();
  const [sendApplication] = useSendApplicationMutation();
  const [editEventExercise] = useEditEventExerciseMutation();

  // State for application dialog
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [numOfAttendees, setNumOfAttendees] = useState(1);

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
      valueFormatter: (params) => formatTime(params),
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
              <IconButton color="primary" onClick={() => handleOpenApplicationDialog(params.row)}>
                <HowToRegIcon />
              </IconButton>
            </Tooltip>
            {isPrivileged && isPendingApproval && (
              <Tooltip title="Potvrdiť otvorené cvičenie">
                <IconButton color="success" onClick={() => handleApproveExercise(params.row._id)}>
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
                  <IconButton color="error">
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
              <strong>Čas:</strong> {selectedExercise && formatTime(selectedExercise.startTime)}
            </Typography>
            <TextField
              label="Počet účastníkov"
              type="number"
              fullWidth
              margin="normal"
              value={numOfAttendees}
              onChange={(e) => setNumOfAttendees(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplicationDialog}>Zrušiť</Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={!numOfAttendees || numOfAttendees < 1}
          >
            Potvrdiť
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetail;
