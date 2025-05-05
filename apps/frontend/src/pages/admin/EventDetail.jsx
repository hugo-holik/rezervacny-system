import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteEventExerciseMutation, useGetEventByIdQuery } from '@app/redux/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Divider, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
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
  const { id: eventId } = useParams(); // Rename to eventId for clarity
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEventByIdQuery({ Id: eventId });
  const [deleteEventExercise] = useDeleteEventExerciseMutation(); // Add the mutation hook

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await deleteEventExercise({ eventId, exerciseId }).unwrap();
      toast.success('Cvičenie bolo úspešne odstránené');
    } catch (error) {
      toast.error('Chyba pri odstraňovaní cvičenia');
      console.error('Delete error:', error);
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
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <ConfirmationDialog
          title={`Naozaj chcete odstrániť cvičenie ${params.row.exerciseName}?`}
          onAccept={() => handleDeleteExercise(params.row._id)}
        >
          <Tooltip title="Odstrániť cvičenie">
            <IconButton size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ),
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
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          >
            <DataGrid
              rows={event.openExercises}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 20, 50]}
              initialState={{
                density: 'standard',
                pagination: {
                  paginationModel: {
                    pageSize: 10
                  }
                }
              }}
              rowHeight={56} // consistent row height
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 1 // vertical padding
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5'
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
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
    </Box>
  );
};

export default EventDetail;
