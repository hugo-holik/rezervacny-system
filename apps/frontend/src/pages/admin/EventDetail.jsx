import { useParams, useNavigate } from 'react-router-dom';
import { useGetAllEventsQuery } from '@app/redux/api';
import { Box, Typography, Paper, Divider, Button, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useGetAllEventsQuery();
  const event = events.find((e) => e._id === id);

  if (isLoading) {
    return <Typography variant="h6" p={2}>Načítavam údaje o udalosti...</Typography>;
  }

  if (!event) {
    return <Typography variant="h6" color="error" p={2}>Udalosť sa nenašla.</Typography>;
  }

  return (
    <Box p={3}>
      {/* Tlačidlo na návrat do zoznamu udalostí */}
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
          <strong>Počet cvičení:</strong> {event.exercises ? event.exercises.length : 0}
        </Typography>

        {/* Zobrazenie zoznamu cvičení */}
        {event.exercises && event.exercises.length > 0 ? (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Pridané cvičenia:
            </Typography>
            <Grid container spacing={2}>
              {event.exercises.map((exercise, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="body2">
                      <strong>Cvičenie {index + 1}: </strong>{exercise.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {exercise.status}
                    </Typography>
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
