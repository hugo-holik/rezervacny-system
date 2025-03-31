import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteExerciseMutation, useGetAllExercisesQuery } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid2, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
// import AddExerciseModal from './components/AddExerciseModal';
// import EditExerciseModal from './components/EditExerciseModal';

const Exercises = () => {
  const { data, isLoading } = useGetAllExercisesQuery();
  const [deleteExercise] = useDeleteExerciseMutation();

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

  const columns = [
    { field: 'name', headerName: 'Názov', flex: 1, minWidth: 150 },
    { field: 'program', headerName: 'Program', flex: 1 },
    { field: 'description', headerName: 'Popis', flex: 1 },
    { field: 'room', headerName: 'Miestnosť', flex: 1 },
    { field: 'duration', headerName: 'Trvanie (min)', flex: 1 },
    { field: 'maxAttendees', headerName: 'Max. počet účastníkov', flex: 1 },
    { field: 'color', headerName: 'Farba', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => {
        return [
          // <EditExerciseModal key={'edit'} exerciseData={params.row} />,
          <ConfirmationDialog
            key={'delete'}
            title={`Naozaj chcete odstrániť cvičenie ${params.row.name}?`}
            onAccept={() => onRemoveHandler(params.row._id)}
          >
            <Tooltip title="Odstráň cvičenie">
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ConfirmationDialog>
        ];
      }
    }
  ];

  const handleRowClick = (params) => {
    console.log(params);
  };

  return (
    <Box py={2}>
      <Grid2 py={1} px={1} container spacing={1}>
        <Grid2 size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Cvičenia
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'}>
          {/* <AddExerciseModal /> */}
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
          slots={{
            toolbar: GridToolbar
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          ignoreDiacritics
          onRowDoubleClick={(params) => {
            handleRowClick(params);
          }}
        />
      </Paper>
    </Box>
  );
};

export default Exercises;
