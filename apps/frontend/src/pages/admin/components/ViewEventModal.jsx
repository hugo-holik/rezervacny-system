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
  return new Date(dateString).toLocaleDateString('sk-SK'); // adjust locale if needed
};

const ViewEventModal = ({ open, onClose, eventData }) => {
  if (!eventData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detail udalosti: {eventData.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          <strong>Termín:</strong> {formatDate(eventData.datefrom)} – {formatDate(eventData.dateto)}
        </Typography>

        <Typography variant="h6">Zoznam cvičení:</Typography>
        {eventData.openExercises?.length ? (
          <List dense>
            {eventData.openExercises.map((exercise, index) => (
              <ListItem key={exercise._id || index}>
                <ListItemText
                  primary={`${formatDate(exercise.date)} – ${exercise.startTime}`}
                  secondary={`Stav: ${exercise.status}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">Žiadne cvičenia priradené.</Typography>
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
    openExercises: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        date: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
      })
    )
  })
};

export default ViewEventModal;
