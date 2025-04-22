import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    List, 
    ListItem, 
    ListItemText 
} from '@mui/material';

const ViewEventModal = ({ open, onClose, eventData }) => {
  if (!eventData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detail udalosti: {eventData.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          <strong>Termín:</strong> {new Date(eventData.datefrom).toLocaleString()} –{' '}
          {new Date(eventData.dateto).toLocaleString()}
        </Typography>

        <Typography variant="h6">Zoznam cvičení:</Typography>
        {eventData.openExercises?.length ? (
          <List dense>
            {eventData.openExercises.map((exercise, index) => (
              <ListItem key={exercise._id || index}>
                <ListItemText
                  primary={`${new Date(exercise.date).toLocaleDateString()} – ${exercise.startTime}`}
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

export default ViewEventModal;
