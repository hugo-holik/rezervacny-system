import ConfirmationDialog from '@app/components/ConfirmationDialog';
import {
  useDeleteApplicationMutation,
  useEditApplicationMutation,
  useGetAllEventsQuery,
  useGetApplicationsQuery,
  useGetColleaguesApplicationsQuery,
  useGetUserMeQuery
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
  const { data: currentUser, isLoading: isUserLoading, isError: isUserError } = useGetUserMeQuery();
  const { data: events, isLoading: isEventsLoading, isError: isEventsError , refetch } = useGetAllEventsQuery();


  const { data: applications = [], isLoading: isApplicationsLoading, isError:isApplicationsError } = useGetApplicationsQuery();
  const { data: colleagueApplications, isLoading: isColleaguesLoading, error: colleaguesError } = useGetColleaguesApplicationsQuery();
  console.log("colleagueApplications", colleagueApplications);
  const [deleteApplication] = useDeleteApplicationMutation();
  const [editApplication] = useEditApplicationMutation();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [numOfAttendees, setNumOfAttendees] = useState(1);

  if (isUserLoading || isEventsLoading || isApplicationsLoading ) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
    if (isUserError || isEventsError || isApplicationsError ) {
    return (
      <Typography color="error" variant="h6" align="center" mt={4}>
        Chyba pri načítaní dát
      </Typography>
    );
  }
  const isLoading = isUserLoading || isEventsLoading || isApplicationsLoading;

const applicationsFromEvents = events?.flatMap(event =>
  event.openExercises?.flatMap(exercise =>
    exercise.attendees
      ?.filter(attendee => {
        if (currentUser?.role === 'Správca cvičení') {
          return true; // vidí všetkých
        }
        // inak len ak sa zhoduje teacher s currentUser._id
        // Pozor, teacher je objekt { $oid: "xxx" }, treba to rozbaliť
        const teacherId = attendee.teacher?.$oid || attendee.teacher;
        return teacherId === currentUser?._id;
      })
      ?.map(attendee => ({
        id: attendee._id?.$oid || attendee._id,
        eventName: event.name,
        date: exercise.date,
        startTime: exercise.startTime,
        numOfAttendees: attendee.numOfAttendees,
        approvalState: attendee.approvalStatus,
        createdAt: attendee.createdAt ?? null,
        approvedAt: attendee.approvedAt ?? null,
        exerciseId: exercise._id?.$oid || exercise._id,
        eventId: event._id?.$oid || event._id,
        applicationId: attendee._id?.$oid || attendee._id,
      })) ?? []
  ) ?? []
) ?? [];

//filtrovanie iba kolegov
const myApplicationIds = applicationsFromEvents.map(app => app.applicationId);
const filteredColleagueApplications = colleagueApplications?.filter(
  app => !myApplicationIds.includes(app.applicationId)
) || [];


//console.log(applications);

/*
  console.log("event", events);
  console.log("application", applications);
  console.log("applicationsFromEvents",applicationsFromEvents);
  */

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
      refetch();
      closeEditDialog();
    } catch (error) {
      toast.error('Error updating application', error);
    }
  };

  const handleApproveApplication = async ({ eventId, exerciseId, applicationId }) => {
  try {
    console.log("Approving application with data:", { eventId, exerciseId, applicationId });

    // Posielame PUT request s approvalState a approvedAt dátami
    const result = await editApplication({
      eventId,
      exerciseId,
      applicationId,
      approvalState: 'schválené',
      approvedAt: new Date().toISOString(),
    }).unwrap();

    console.log("Prihláška bola úspešne potvrdená", result);
    refetch();

  } catch (error) {
    // Ošetrenie prípadov, keď error.data je null
    const errorMessage = error?.data?.message ?? error?.message ?? 'Unknown error';
    console.error("Error pri potvrdzovaní prihlášky:", errorMessage);
    alert(`Error pri potvrdzovaní prihlášky: ${errorMessage}`);
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
      refetch();
    } catch (error) {
      toast.error('Error rejecting application', error);
    }
  };

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
      refetch();
    } catch (error) {
      toast.error('Error deleting application', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'čaká na schválenie': return 'warning';
      case 'schválené': return 'success';
      case 'zamietnuté': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString, formatString) => {
    try {
      return dateString ? format(new Date(dateString), formatString) : 'N/A';
    } catch {
      return 'Invalid Date';
    }
  };
  

  let columns = [
    { field: 'eventName', headerName: 'Názov cvičenia', width: 100 },
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
    { field: 'numOfAttendees', headerName: 'Počet účastníkov', flex: 1, type: 'number' },
    {
      field: 'approvalState',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value || 'Neznámy'} color={getStatusColor(params.value)} variant="outlined" />
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
    }
  ];

  if (currentUser?.role !== 'Externý učiteľ') {
    columns.push({
      field: 'approvalActions',
      headerName: 'Schváliť/Odmietnuť',
      width: 100,
      renderCell: (params) => {
        const isPending = params.row.approvalState === 'čaká na schválenie' || !params.row.approvalState;
        return isPending ? (
          <Box display="flex" gap={1}>
            <ConfirmationDialog
              key="approve"
              title={`Potvrdiť prihlášku pre ${params.row.exerciseName}?`}
              onAccept={() => handleApproveApplication(params.row)}
            >
              <Tooltip title="Potvrdiť prihlášku">
                <IconButton><CheckCircleIcon fontSize="small" /></IconButton>
              </Tooltip>
            </ConfirmationDialog>

            <ConfirmationDialog
              key="reject"
              title={`Odmietnuť prihlášku pre ${params.row.exerciseName}?`}
              onAccept={() => handleRejectApplication(params.row)}
            >
              <Tooltip title="Odmietnuť prihlášku">
                <IconButton><CancelIcon fontSize="small" /></IconButton>
              </Tooltip>
            </ConfirmationDialog>
          </Box>
        ) : null;
      }
    });
  }

  if (currentUser?.role !== 'Externý učiteľ') {
    columns.push({
      field: 'actions',
      headerName: 'Akcie',
      type: 'actions',
      width: 180,
      getActions: (params) => [
        <Tooltip key="edit" title="Upraviť prihlášku">
          <IconButton onClick={() => openEditDialog(params.row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>,
        <ConfirmationDialog
          key="delete"
          title={`Odstrániť prihlášku pre ${params.row.exerciseName}?`}
          onAccept={() => handleDeleteApplication(params.row)}
        >
          <Tooltip title="Odstrániť prihlášku">
            <IconButton><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ]
    });
  }

  return (
    <Box py={2}>
      <Typography variant="h4" px={2} py={1}>Prihlášky</Typography>

      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={applicationsFromEvents || []}
          columns={columns}
          getRowId={(row) => row.applicationId ?? `${row.eventId}-${row.exerciseId}-${row.attendeeId}`}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'standard',
            pagination: { paginationModel: { pageSize: 20 } }
          }}
          isRowSelectable={() => false}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
        />
      </Paper>

      {currentUser?.role === 'Externý učiteľ' && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Prihlášky kolegov z mojej školy
          </Typography>
          {isColleaguesLoading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : colleaguesError ? (
            <Typography color="error" variant="h6" align="center" mt={4}>
              Chyba pri načítaní kolegových prihlášok
            </Typography>
          ) : (filteredColleagueApplications?.length === 0 ? (
            <Typography variant="h6" align="center" mt={4}>
              Žiadne prihlášky od kolegov z vašej školy.
            </Typography>
          ) : (
            <Paper>
              <DataGrid
                rows={filteredColleagueApplications}
                columns={columns}
                getRowId={(row) => `${row.applicationId}-colleague`}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true } }}
              />
            </Paper>
          ))}
        </Box>
      )}
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
          <Button onClick={handleEditSave} variant="contained" disabled={!numOfAttendees || numOfAttendees < 1}>
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;
