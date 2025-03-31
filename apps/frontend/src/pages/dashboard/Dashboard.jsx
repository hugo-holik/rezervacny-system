import {
  useGetAllExercisesQuery,
  useGetAllExternalSchoolsQuery,
  useGetUsersListQuery
} from '@app/redux/api';
import { Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { data: usersData, isLoading: usersLoading } = useGetUsersListQuery();
  const { data: externalSchoolsData, isLoading: externalSchoolsLoading } =
    useGetAllExternalSchoolsQuery();
  const { data: exercisesData, isLoading: exercisesLoading } = useGetAllExercisesQuery();

  const [usersCount, setUsersCount] = useState(0);
  const [externalSchoolsCount, setExternalSchoolsCount] = useState(0);
  const [exercisesCount, setExercisesCount] = useState(0);

  useEffect(() => {
    if (!usersLoading && usersData) {
      setUsersCount(usersData.length);
    }
    if (!externalSchoolsLoading && externalSchoolsData) {
      setExternalSchoolsCount(externalSchoolsData.length);
    }
    if (!exercisesLoading && exercisesData) {
      setExercisesCount(exercisesData.length);
    }
  }, [
    usersData,
    externalSchoolsData,
    exercisesData,
    usersLoading,
    externalSchoolsLoading,
    exercisesLoading
  ]);

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Prehľad štatistík
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Celkový počet používateľov
            </Typography>
            {usersLoading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h4">{usersCount}</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Počet externých škôl
            </Typography>
            {externalSchoolsLoading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h4">{externalSchoolsCount}</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Celkový počet cvičení
            </Typography>
            {exercisesLoading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h4">{exercisesCount}</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add more info below if needed */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" align="center">
          Viac informácií o projekte a jeho funkcionalitách nájdete na stránke Info.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
