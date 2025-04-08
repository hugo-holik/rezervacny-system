import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteEventMutation, useGetAllEventsQuery } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Grid2, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import AddEventModal from './components/AddEventModal';
import EditEventModal from './components/EditEventModal';

const Events = () => {
  const { data, isLoading } = useGetAllEventsQuery();
  const [deleteEvent] = useDeleteEventMutation();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const onRemoveHandler = async (id) => {
    if (!id) {
      console.error('Error: ID is undefined!');
      toast.error('Error: Cannot delete, ID is missing.');
      return;
    }

    const response = await deleteEvent(id);
    if (!response.error) {
      toast.success('Udalosť bola úspešne odstránená');
    } else {
      toast.error('Chyba pri odstraňovaní udalosti: ' + response.error?.data?.message);
    }
  };

  const handleRowClick = (params) => {
    setSelectedEvent(params.row);
    setOpenEditModal(true);
  };

  const columns = [
    { field: 'name', headerName: 'Názov', flex: 1 },
    {
      field: 'datefrom',
      headerName: 'Od dátumu',
      flex: 1,
      valueGetter: (value) => formatDate(value)
    },
    {
      field: 'dateto',
      headerName: 'Do dátumu',
      flex: 1,
      valueGetter: (value) => formatDate(value)
    },
    {
      field: 'dateClosing',
      headerName: 'Uzávierka',
      flex: 1,
      valueGetter: (value) => formatDate(value)
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => [
        <Tooltip key="edit" title="Upraviť udalosť">
          <IconButton onClick={() => handleRowClick(params)}>
            <EditIcon />
          </IconButton>
        </Tooltip>,
        <ConfirmationDialog
          key="delete"
          title={`Naozaj chcete odstrániť udalosť ${params.row.name}?`}
          onAccept={() => onRemoveHandler(params.row._id)}
        >
          <Tooltip title="Odstráň udalosť">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ]
    }
  ];

  const formatDate = (input) => {
    if (!input) return 'Neplatný dátum';

    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        return 'Neplatný dátum';
      }

      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());

      return `${day}.${month}.${year} - ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Neplatný dátum';
    }
  };

  return (
    <Box py={2}>
      <Grid2 py={1} px={1} container spacing={1}>
        <Grid2 size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Udalosti
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'}>
          <Button
            sx={{ m: 1, minWidth: '15rem' }}
            variant="contained"
            color="primary"
            onClick={() => setOpenAddModal(true)}
          >
            Pridaj udalosť
          </Button>
        </Grid2>
      </Grid2>

      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data || []}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'compact',
            pagination: {
              paginationModel: {
                pageSize: 20
              }
            }
          }}
          isRowSelectable={() => false}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          ignoreDiacritics
        />
      </Paper>

      {/* Add Event Modal */}
      <AddEventModal open={openAddModal} onClose={() => setOpenAddModal(false)} />

      {/* Edit Event Modal */}
      <EditEventModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        eventData={selectedEvent}
      />
    </Box>
  );
};

export default Events;
