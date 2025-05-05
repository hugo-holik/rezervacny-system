import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteApplicationMutation, useGetApplicationsQuery } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Applications = () => {
  const { data: applications, isLoading, isError } = useGetApplicationsQuery();
  const [deleteApplication] = useDeleteApplicationMutation();

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'čaká na schválenie':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString, formatString) => {
    try {
      return dateString ? format(new Date(dateString), formatString) : 'N/A';
    } catch {
      return 'Invalid Date';
    }
  };

  const columns = [
    {
      field: 'exerciseName',
      headerName: 'Exercise Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy')
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'HH:mm')
    },
    {
      field: 'numOfAttendees',
      headerName: 'Attendees',
      flex: 1,
      type: 'number'
    },
    {
      field: 'maxAttendees',
      headerName: 'Max Attendees',
      flex: 1,
      type: 'number'
    },
    {
      field: 'approvalState',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params?.value || 'Unknown'}
          color={getStatusColor(params?.value)}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy HH:mm')
    },
    {
      field: 'approvedAt',
      headerName: 'Approved At',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy HH:mm')
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <ConfirmationDialog
          key={'delete'}
          title={`Delete application for ${params?.row?.exerciseName || 'this exercise'}?`}
          onAccept={() => handleDeleteApplication(params.row)}
        >
          <Tooltip title="Delete application">
            <IconButton size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ]
    }
  ];

  const handleDeleteApplication = async (row) => {
    console.log('Deleting row:', row); // Add this to debug
    console.log('Deleting row:', row.applicationId); // Add this to debug
    console.log('Deleting row:', row.exerciseId); // Add this to debug
    console.log('Deleting row:', row.eventId); // Add this to debug

    if (!row?.applicationId || !row?.exerciseId || !row?.eventId) {
      toast.error('Missing required IDs for deletion');
      return;
    }

    try {
      await deleteApplication({
        eventId: row.eventId,
        exerciseId: row.exerciseId,
        applicationId: row.applicationId
      }).unwrap();
      toast.success('Application deleted successfully');
    } catch (error) {
      toast.error('Error deleting application');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="h6" align="center" mt={4}>
        Error loading applications
      </Typography>
    );
  }

  return (
    <Box py={2}>
      <Grid py={1} px={1} container spacing={1}>
        <Grid item xs={12} sm={9} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Prihlášky
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} justifyContent={'flex-end'} display={'flex'}>
          {/* Add your "Add Application" button/modal here if needed */}
        </Grid>
      </Grid>

      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={applications || []}
          columns={columns}
          getRowId={(row) => row?.applicationId}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'comfortable',
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
          sx={{
            '& .MuiDataGrid-row': {
              minHeight: '52px !important',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            },
            '& .MuiDataGrid-cell': {
              py: 2,
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiDataGrid-columnHeaders': {
              minHeight: '56px !important'
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default Applications;
