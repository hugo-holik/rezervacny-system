import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteExternalSchoolMutation, useGetAllExternalSchoolsQuery } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import AddExternalSchoolModal from './components/AddExternalSchoolModal';
import EditExternalSchoolModal from './components/EditExternalSchoolModal';
const ExternalSchools = () => {
  const { data, isLoading } = useGetAllExternalSchoolsQuery();
  const [deleteExternalSchool] = useDeleteExternalSchoolMutation();

  const onRemoveHandler = async (id) => {
    if (!id) {
      console.error('Error: ID is undefined!');
      toast.error('Error: Cannot delete, ID is missing.');
      return;
    }
    console.log(id);
    console.log({ id });
    const response = await deleteExternalSchool(id); // Pass an object
    if (!response.error) {
      toast.success('Externá škola bola úspešne odstránená');
    } else {
      toast.error('Chyba pri odstraňovaní externej školy: ' + response.error?.data?.message);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Názov', flex: 1, minWidth: 150 },
    { field: 'address', headerName: 'Adresa', flex: 1 },
    { field: 'contactPerson', headerName: 'Kontaktná osoba', flex: 1 },
    { field: 'telNumber', headerName: 'Telefónne číslo', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => {
        return [
          <EditExternalSchoolModal key={'edit'} externalSchoolData={params.row} />,
          <ConfirmationDialog
            key={'delete'}
            title={`Naozaj chcete odstrániť externú školu ${params.row.name} ${params.row.address} ?`}
            onAccept={() => onRemoveHandler(params.row._id)}
          >
            <Tooltip title="Odstráň externú školu">
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
    //NOTE ak chceme na dvojklik nejaku aktivitu
    console.log(params);
  };

  return (
    <Box py={2}>
      <Grid py={1} px={1} container spacing={1}>
        <Grid size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Externé školy
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'}>
          <AddExternalSchoolModal />
        </Grid>
      </Grid>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'standard',
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

export default ExternalSchools;
