import ConfirmationDialog from '@app/components/ConfirmationDialog';
import CenteredCheckIcon from '@app/components/table/CenteredCheckIcon';
import {
  useGetExternalSchoolByIdQuery,
  useGetUsersListQuery,
  useRemoveUserMutation
} from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid2, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';

const ExternalSchoolCell = ({ schoolId }) => {
  const { data: school, isLoading } = useGetExternalSchoolByIdQuery(schoolId, {
    skip: !schoolId // Skip query if no schoolId
  });

  if (isLoading) return <Typography variant="body2">Načítava sa...</Typography>;
  if (!school) return <Typography variant="body2">Neznáme</Typography>;

  return (
    <Typography variant="body2">
      {school.name} - {school.address}
    </Typography>
  );
};

ExternalSchoolCell.propTypes = {
  schoolId: PropTypes.string
};

const UsersList = () => {
  const { data, isLoading } = useGetUsersListQuery();
  const [removeUser] = useRemoveUserMutation();

  const onRemoveHandler = async (id) => {
    const response = await removeUser(id);
    if (!response.error) {
      toast.success('Uzivatel bol uspesne odstraneny');
    } else {
      toast.error('Chyba pri odstranovani pouzivatela: ' + response.error?.data?.message);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Meno', flex: 1, minWidth: 150 },
    { field: 'surname', headerName: 'Priezvisko', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'externalSchool',
      headerName: 'Externá škola',
      flex: 1,
      renderCell: (params) => <ExternalSchoolCell schoolId={params.value} />
    },
    {
      field: 'isAdmin',
      headerName: 'Admin účet',
      flex: 1,
      renderCell: (params) => (params.row.isAdmin ? <CenteredCheckIcon /> : null)
    },
    {
      field: 'isActive',
      headerName: 'Účet aktívny',
      flex: 1,
      renderCell: (params) => (params.row.isActive ? <CenteredCheckIcon /> : null)
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => {
        return [
          <EditUserModal key={'edit'} userData={params.row} />,
          <ConfirmationDialog
            key={'delete'}
            title={`Naozaj chcete odstrániť používateľa ${params.row.name} ${params.row.surname} ?`}
            onAccept={() => onRemoveHandler(params.row._id)}
          >
            <Tooltip title="Odstráň používateľa">
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
            Používatelia
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'}>
          <AddUserModal />
        </Grid2>
      </Grid2>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data}
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

export default UsersList;
