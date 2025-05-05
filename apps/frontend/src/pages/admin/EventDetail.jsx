import { useGetEventByIdQuery } from '@app/redux/api'; // Import the specific query
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEventByIdQuery({ Id: id }); // Use the specific query

  if (isLoading) {
    return (
      <Typography variant="h6" p={2}>
        Načítavam údaje o udalosti...
      </Typography>
    );
  }

  if (!event) {
    return (
      <Typography variant="h6" color="error" p={2}>
        Udalosť sa nenašla.
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Späť
      </Button>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {event.name}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">
          <strong>Dátum od:</strong> {formatDate(event.datefrom)}
        </Typography>
        <Typography variant="body1">
          <strong>Dátum do:</strong> {formatDate(event.dateto)}
        </Typography>
        <Typography variant="body1">
          <strong>Deadline na prihlásenie:</strong> {formatDate(event.dateClosing)}
        </Typography>
        <Typography variant="body1">
          <strong>Status:</strong> {event.published ? 'Publikované' : 'Nepublikované'}
        </Typography>

        {/* Zobrazenie počtu cvičení */}
        <Typography variant="body1" mt={2}>
          <strong>Počet cvičení:</strong> {event.openExercises ? event.openExercises.length : 0}
        </Typography>

        {/* Zobrazenie zoznamu cvičení */}
        {event.openExercises && event.openExercises.length > 0 ? (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Pridané cvičenia:
            </Typography>
            <Grid container spacing={2}>
              {event.openExercises.map((exercise) => (
                <Grid item xs={12} sm={6} md={4} key={exercise._id}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle1">
                      <strong>{exercise.exerciseName}</strong>
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dátum:</strong> {formatDate(exercise.date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Čas začiatku:</strong> {formatTime(exercise.startTime)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {exercise.status}
                    </Typography>
                    {exercise.note && (
                      <Typography variant="body2">
                        <strong>Poznámka:</strong> {exercise.note}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography variant="body1" mt={2}>
            Cvičenia ešte neboli pridané.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default EventDetail;
