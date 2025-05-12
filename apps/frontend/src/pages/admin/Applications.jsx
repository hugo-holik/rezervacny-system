import ConfirmationDialog from '@app/components/ConfirmationDialog';
import {
  useDeleteApplicationMutation,
  useEditApplicationMutation,
  useGetApplicationsQuery
} from '@app/redux/api';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'react-toastify';

const Applications = () => {
  // const { data: currentUser } = useGetUserMeQuery();

  const { data: applications, isLoading, isError } = useGetApplicationsQuery();
  const [deleteApplication] = useDeleteApplicationMutation();
  const [editApplication] = useEditApplicationMutation();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [numOfAttendees, setNumOfAttendees] = useState(1);

  const openEditDialog = (application) => {
    setSelectedApplication(application);
    setNumOfAttendees(application.numOfAttendees);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleEditSave = async () => {
    try {
      await editApplication({
        eventId: selectedApplication.eventId,
        exerciseId: selectedApplication.exerciseId,
        applicationId: selectedApplication.applicationId,
        numOfAttendees: Number(numOfAttendees)
      }).unwrap();
      toast.success('Application updated successfully');
      closeEditDialog();
    } catch (error) {
      toast.error('Error updating application', error);
    }
  };

  const handleApproveApplication = async (row) => {
    if (!row?.applicationId || !row?.exerciseId || !row?.eventId) {
      toast.error('Missing required IDs for approval');
      return;
    }
    try {
      await editApplication({
        eventId: row.eventId,
        exerciseId: row.exerciseId,
        applicationId: row.applicationId,
        approvalState: 'schválené',
        approvedAt: new Date().toISOString()
      }).unwrap();
      toast.success('Application approved successfully');
    } catch (error) {
      toast.error('Error approving application', error);
    }
  };

  const handleRejectApplication = async (row) => {
    if (!row?.applicationId || !row?.exerciseId || !row?.eventId) {
      toast.error('Missing required IDs for rejection');
      return;
    }
    try {
      await editApplication({
        eventId: row.eventId,
        exerciseId: row.exerciseId,
        applicationId: row.applicationId,
        approvalState: 'zamietnuté'
      }).unwrap();
      toast.success('Application rejected successfully');
    } catch (error) {
      toast.error('Error rejecting application', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'čaká na schválenie':
        return 'warning';
      case 'schválené':
        return 'success';
      case 'zamietnuté':
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
      headerName: 'Názov cvičenia',
      width: 100
    },
    {
      field: 'date',
      headerName: 'Dátum',
      width: 100,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy')
    },
    {
      field: 'startTime',
      headerName: 'Začiatok',
      width: 80,
      valueFormatter: (params) => formatDate(params, 'HH:mm')
    },
    {
      field: 'numOfAttendees',
      headerName: 'Počet účastníkov',
      flex: 1,
      type: 'number'
    },
    {
      field: 'maxAttendees',
      headerName: 'Max. počet účastníkov',
      flex: 1,
      type: 'number'
    },
    {
      field: 'approvalState',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Neznámy'}
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Podané o',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy HH:mm')
    },
    {
      field: 'approvedAt',
      headerName: 'Potvrdené o',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy HH:mm')
    },
    {
      field: 'approvalActions', // New column for approve/reject actions
      headerName: 'Schváliť/Odmietnuť',
      width: 100,
      renderCell: (params) => {
        const isPending =
          params.row.approvalState === 'čaká na schválenie' || !params.row.approvalState;

        if (isPending) {
          return (
            <>
              <ConfirmationDialog
                key="approve"
                title={`Potvrdiť prihlášku pre ${params?.row?.exerciseName || 'toto cvičenie'}?`}
                onAccept={() => handleApproveApplication(params.row)}
              >
                <Tooltip title="Potvrdiť prihlášku">
                  <IconButton color="default">
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ConfirmationDialog>

              <ConfirmationDialog
                key="reject"
                title={`Odmietnuť prihlášku pre ${params?.row?.exerciseName || 'toto cvičenie'}?`}
                onAccept={() => handleRejectApplication(params.row)}
              >
                <Tooltip title="Odmietnuť prihlášku">
                  <IconButton color="default">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ConfirmationDialog>
            </>
          );
        }
        return null; // Nothing if not pending
      }
    },
    {
      field: 'actions',
      headerName: 'Akcie',
      type: 'actions',
      width: 180,
      getActions: (params) => {
        // const isPrivileged = ['Správca cvičení'].includes(currentUser.role) || currentUser.isAdmin;

        // Actions only for non-pending statuses (edit/delete)
        const actions = [
          <Tooltip key="edit" title="Upraviť prihlášku">
            <IconButton color="default" onClick={() => openEditDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>,
          <ConfirmationDialog
            key="delete"
            title={`Delete application for ${params?.row?.exerciseName || 'this exercise'}?`}
            onAccept={() => handleDeleteApplication(params.row)}
          >
            <Tooltip title="Odstrániť prihlášku">
              <IconButton color="default">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ConfirmationDialog>
        ];

        return actions; // Only show edit/delete actions if it's not pending
      }
    }
  ];

  const handleDeleteApplication = async (row) => {
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
      toast.error('Error deleting application', error);
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
      </Grid>

      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={applications || []}
          columns={columns}
          getRowId={(row) => row?.applicationId}
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

      <Dialog open={editDialogOpen} onClose={closeEditDialog}>
        <DialogTitle>Upraviť počet účastníkov</DialogTitle>
        <DialogContent>
          <TextField
            label="Počet účastníkov"
            type="number"
            fullWidth
            value={numOfAttendees}
            onChange={(e) => setNumOfAttendees(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Zrušiť</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={!numOfAttendees || numOfAttendees < 1}
          >
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;
