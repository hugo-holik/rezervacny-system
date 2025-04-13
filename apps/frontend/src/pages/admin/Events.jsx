import { useGetAllEventsQuery, useAddExerciseToEventMutation, useDeleteEventMutation } from '@app/redux/api'; 
import { Box, Button, Grid, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import AddEventModal from './components/AddEventModal';
import EditEventModal from './components/EditEventModal';
import AddExerciseToEventModal from './components/AddExerciseToEventModal'; 

const Events = () => {
  const { data, isLoading } = useGetAllEventsQuery();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddExerciseModal, setOpenAddExerciseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [deleteEvent] = useDeleteEventMutation();
  const [addExerciseToEvent] = useAddExerciseToEventMutation();

  const handleEditClick = (params) => {
    setSelectedEvent(params.row);
    setOpenEditModal(true);
  };

  const handleAddExerciseClick = (params) => {
    setSelectedEvent(params.row);
    setOpenAddExerciseModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    deleteEvent({ eventId })
      .unwrap()
      .then(() => {
        toast.success('Udalosť bola úspešne odstránená!');
      })
      .catch((error) => {
        toast.error('Chyba pri odstraňovaní udalosti');
      });
  };

  const formatDate = (input) => {
    if (!input || input === '—') return '—'; // Return fallback if no date is present
  
    const date = new Date(input);
    if (isNaN(date.getTime())) return 'Neplatný dátum'; // Invalid date
  
    const pad = (n) => String(n).padStart(2, '0');

    console.log('Raw date:', row?.datefrom);  // Check if this is a valid date
    console.log('Formatted date:', formatDate(row?.datefrom)); // Check the formatted result
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  
  
    /*
  if (data && data.length > 0) {
    console.log("Raw data:", data);
    console.log("Date from (first event):", data[0]?.datefrom);
    console.log("Parsed date:", new Date(data[0]?.datefrom));
  
  }
*/
  const columns = [
    {
      field: 'name',
      headerName: 'Názov',
      flex: 1,
    },
    {
      field: 'datefrom',
      headerName: 'Dátum od',
      flex: 1,
      valueGetter: ({ row }) => formatDate(new Date(row?.datefrom)), // Ensure it's a Date object
    },
    {
      field: 'dateto',
      headerName: 'Dátum do',
      flex: 1,
      valueGetter: ({ row }) => formatDate(new Date(row?.dateto)), // Ensure it's a Date object
    },
    {
      field: 'dateClosing',
      headerName: 'Deadline',
      flex: 1,
      valueGetter: ({ row }) => formatDate(new Date(row?.dateClosing)), // Ensure it's a Date object
    },
    {
      field: 'actions',
      headerName: 'Akcie',
      type: 'actions',
      getActions: (params) => [
        <Tooltip key="edit" title="Upraviť udalosť">
          <IconButton onClick={() => handleEditClick(params)}>
            <EditIcon />
          </IconButton>
        </Tooltip>,
        <Tooltip key="add" title="Pridať cvičenie">
          <IconButton onClick={() => handleAddExerciseClick(params)}>
            <AddIcon />
          </IconButton>
        </Tooltip>,
        <ConfirmationDialog
          key="delete"
          title={`Naozaj chcete odstrániť udalosť ${params.row.name}?`}
          onAccept={() => handleDeleteEvent(params.row._id)}
        >
          <Tooltip title="Odstrániť">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ]
    }
  ];
  
  

  return (
    <Box py={2}>
      <Grid container spacing={1} px={2}>
        <Grid item xs={9}>
          <Typography variant="h4">Špeciálne cvičenia</Typography>
        </Grid>
        <Grid item xs={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            Pridaj udalosť
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data || []}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }}
        />
      </Paper>

      <AddEventModal open={openAddModal} onClose={() => setOpenAddModal(false)} />
      <EditEventModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        eventData={selectedEvent}
      />
      <AddExerciseToEventModal
        open={openAddExerciseModal}
        onClose={() => setOpenAddExerciseModal(false)}
        eventData={selectedEvent}
      />
    </Box>
  );
};

export default Events;
