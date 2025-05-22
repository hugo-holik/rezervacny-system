import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { useDeleteEventMutation, useGetAllEventsQuery, useGetUserMeQuery, useTogglePublishedMutation } from '@app/redux/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddEventModal from './components/AddEventModal';
import AddExerciseToEventModal from './components/AddExerciseToEventModal';
import EditEventModal from './components/EditEventModal';

const Events = () => {
  const { data: events, isLoading } = useGetAllEventsQuery();
  const { data: currentUser = [] } = useGetUserMeQuery();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddExerciseModal, setOpenAddExerciseModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const roleCheck = ['Zamestnanec UNIZA', 'Správca cvičení'].includes(currentUser.role);
  const navigate = useNavigate();
  const [togglePublished] = useTogglePublishedMutation();


  const [deleteEvent] = useDeleteEventMutation();

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setOpenEditModal(true);
  };

  const handleAddExerciseClick = (event) => {
    setSelectedEvent(event);
    setOpenAddExerciseModal(true);
  };

  const handleViewEvent = (event) => {
    navigate(`/events/${event._id}`);
  };

  //TODO: pridat API ked bude rdy
  const handleTogglePublished = async (event) => {
    try {
      await togglePublished(event._id); // voláme API s ID eventu
      toast.success(`Udalosť ${event.published ? 'odzverejnená' : 'zverejnená'} úspešne!`);
    } catch (error) {
      toast.error('Chyba pri zmene stavu publikácie');
      console.error('Toggle error:', error);
    }
  };

  const handleDeleteEvent = (eventId) => {
    deleteEvent(eventId)
      .unwrap()
      .then(() => {
        toast.success('Udalosť bola úspešne odstránená!');
      })
      .catch((error) => {
        toast.error('Chyba pri odstraňovaní udalosti');
        console.error('Delete error:', error);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  };

  return (
    <Box py={2}>
      <Grid container justifyContent="space-between" alignItems="center" px={1}>
        <Typography variant="h4">Špeciálne cvičenia</Typography>
        {(roleCheck || currentUser.isAdmin) && (
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            Pridaj udalosť
          </Button>
        )}
      </Grid>

      <Grid container spacing={2} mt={2}>
        {isLoading ? (
          <Typography>Načítavam...</Typography>
        ) : (
          (events || [])
            .filter(event => {
              if (currentUser.role === 'Externý učiteľ') {
              return event.published;
            }
            return true;
          }).map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.005)'
                  }
                }}
                onClick={() => handleViewEvent(event)}
              >
                <CardHeader title={event.name} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    <strong>Od:</strong> {formatDate(event.datefrom)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Do:</strong> {formatDate(event.dateto)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Deadline:</strong> {formatDate(event.dateClosing)}
                  </Typography>
                  {(roleCheck || currentUser.isAdmin) && (
                    <Typography variant="body2">
                      <strong>Status:</strong> {event.published ? 'Publikované' : 'Nepublikované'}
                    </Typography>
                  )}
                </CardContent>
                {(roleCheck || currentUser.isAdmin) && (
                  <CardActions onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Upraviť udalosť">
                      <IconButton onClick={() => handleEditClick(event)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Pridať cvičenie">
                      <IconButton onClick={() => handleAddExerciseClick(event)}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <ConfirmationDialog
                      title={`Naozaj chcete odstrániť udalosť ${event.name}?`}
                      onAccept={() => handleDeleteEvent(event._id)}
                    >
                      <Tooltip title="Odstrániť">
                        <IconButton>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ConfirmationDialog>
                    <Tooltip title={event.published ? 'Odzverejniť' : 'Zverejniť'}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={event.published}
                            onChange={() => handleTogglePublished(event)}
                            color="success"
                          />
                        }
                        label={event.published ? 'Odzverejniť' : 'Zverejniť'}
                      />
                    </Tooltip>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))
        )}
      </Grid>

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
