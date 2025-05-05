import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('sk-SK');
};

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString('sk-SK', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ViewEventModal = ({ open, onClose, eventData }) => {
  if (!eventData) return null;

  // Check if openExercises exists and has items
  const hasExercises = eventData.openExercises?.length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detail udalosti: {eventData.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          <strong>Termín:</strong> {formatDate(eventData.datefrom)} – {formatDate(eventData.dateto)}
        </Typography>
        <Typography variant="body2" mb={2}>
          <strong>Deadline:</strong> {formatDate(eventData.dateClosing)}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Zoznam cvičení:
        </Typography>

        {hasExercises ? (
          <List dense>
            {eventData.openExercises.map((exercise, index) => (
              <ListItem key={exercise._id || index} alignItems="flex-start">
                <ListItemText
                  primary={
                    <>
                      <strong>{exercise.exerciseName}</strong> <br />
                      <span>Dátum: {formatDate(exercise.date)}</span> <br />
                      <span>Čas: {formatTime(exercise.startTime)}</span>
                    </>
                  }
                  secondary={
                    <>
                      <span>Stav: {exercise.status}</span>
                      <br />
                      {exercise.note && <span>Poznámka: {exercise.note}</span>}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">Cvičenia ešte neboli pridané.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

ViewEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    datefrom: PropTypes.string.isRequired,
    dateto: PropTypes.string.isRequired,
    dateClosing: PropTypes.string.isRequired,
    openExercises: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        date: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        exerciseName: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        note: PropTypes.string
      })
    )
  })
};

export default ViewEventModal;
