import ConfirmationDialog from '@app/components/ConfirmationDialog';
import {
  useDeleteExerciseMutation,
  useGetAllExercisesQuery,
  useGetUserMeQuery,
  useGetUsersListQuery
} from '@app/redux/api';
// import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { Box, Button, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import AddExerciseModal from './components/AddExerciseModal';
import EditExerciseModal from './components/EditExerciseModal';

const Exercises = () => {
  const {
    data,
    isLoading,
    refetch // <- this will be used to reload data after update
  } = useGetAllExercisesQuery();
  const { data: users = [], isLoading: usersLoading } = useGetUsersListQuery();
  const { data: currentUser = [] } = useGetUserMeQuery();
  const [deleteExercise] = useDeleteExerciseMutation();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const roleCheck = ['Zamestnanec UNIZA', 'Správca cvičení'].includes(currentUser.role);

  const onRemoveHandler = async (id) => {
    if (!id) {
      console.error('Error: ID is undefined!');
      toast.error('Error: Cannot delete, ID is missing.');
      return;
    }
    const response = await deleteExercise(id);
    if (!response.error) {
      toast.success('Cvičenie bolo úspešne odstránené');
    } else {
      toast.error('Chyba pri odstraňovaní cvičenia: ' + response.error?.data?.message);
    }
  };

  const handleRowClick = (params) => {
    setSelectedExercise(params.row);
    setOpenEditModal(true);
  };

  const userMap = users.reduce((acc, user) => {
    if (currentUser.role === 'Zamestnanec UNIZA') {
      if (user._id === currentUser._id) {
        acc[user._id] = user.name;
      }
    } else {
      if (user.role === 'Zamestnanec UNIZA') {
        acc[user._id] = user.name;
      }
    }
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return '-'; // Handle undefined dateString

    const date = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const columns = [
    { field: 'name', headerName: 'Názov', flex: 1, minWidth: 150 },
    { field: 'program', headerName: 'Program', flex: 1 },
    { field: 'description', headerName: 'Popis', flex: 1 },
    { field: 'room', headerName: 'Miestnosť', flex: 1 },
    {
      field: 'startTimes',
      headerName: 'Začiatok',
      flex: 1,
      valueFormatter: (params) => {
        if (params && Array.isArray(params)) {
          return params.map((time) => formatDate(time)).join(', ');
        }
        return '-';
      }
    },
    { field: 'duration', headerName: 'Trvanie (min)', flex: 1 },
    { field: 'maxAttendees', headerName: 'Max. počet účastníkov', flex: 1 },
    {
      field: 'leads',
      headerName: 'Vyučujúci',
      flex: 1,
      valueGetter: (params) => {
        const leadIds = params ?? []; // Safely get the leads array, default to []
        return leadIds
          .map((id) => userMap[id])
          .filter(Boolean)
          .join(', ');
      }
    },
    { field: 'color', headerName: 'Farba', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      width: 200,
      getActions: (params) => {
        const isPrivileged = roleCheck || currentUser.isAdmin;

        const actions = [];
        if (isPrivileged) {
          actions.unshift(
            // Add privileged actions at the beginning
            <Tooltip key="edit" title="Upraviť cvičenie">
              <IconButton onClick={() => handleRowClick(params)}>
                <EditIcon />
              </IconButton>
            </Tooltip>,
            <ConfirmationDialog
              key="delete"
              title={`Naozaj chcete odstrániť cvičenie ${params.row.name}?`}
              onAccept={() => onRemoveHandler(params.row._id)}
            >
              <Tooltip title="Odstráň cvičenie">
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ConfirmationDialog>
          );
        }
        return actions;
      }
    }
  ];

  return (
    <Box py={2}>
      <Grid py={1} px={1} container spacing={1}>
        <Grid size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Cvičenia
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'}>
          {(roleCheck || currentUser.isAdmin) && (
            <Button
              sx={{ m: 1, minWidth: '15rem' }}
              variant="contained"
              color="primary"
              onClick={() => setOpenAddModal(true)}
            >
              Pridaj cvičenie
            </Button>
          )}
        </Grid>
      </Grid>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading || usersLoading}
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
          slots={{
            toolbar: GridToolbar
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          ignoreDiacritics
        />
      </Paper>

      <AddExerciseModal open={openAddModal} onClose={() => setOpenAddModal(false)} />
      {openEditModal && selectedExercise && (
        <EditExerciseModal
          open={openEditModal}
          onClose={(shouldRefresh) => {
            setOpenEditModal(false);
            setSelectedExercise(null);
            if (shouldRefresh) {
              refetch();
            }
          }}
          exerciseData={selectedExercise}
          users={users}
        />
      )}
    </Box>
  );
};

export default Exercises;
