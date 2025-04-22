import {
  useGetAllEventsQuery,
  useGetAllExercisesQuery,
  useGetAllExternalSchoolsQuery,
  useGetUsersListQuery
} from '@app/redux/api';
import { Box, CircularProgress, Container, Grid, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Events from '../admin/Events';
import Exercises from '../admin/Exercises'; // Import UsersList component
import ExternalSchools from '../admin/ExternalSchools'; // Import ExternalSchools component
import UsersList from '../admin/UsersList'; // Import UsersList component

const Dashboard = () => {
  const [userRolesData, setUserRolesData] = useState([]);

  const { data: usersData, isLoading: usersLoading } = useGetUsersListQuery();
  const { data: externalSchoolsData, isLoading: externalSchoolsLoading } =
    useGetAllExternalSchoolsQuery();
  const { data: exercisesData, isLoading: exercisesLoading } = useGetAllExercisesQuery();
  const { data: eventsData, isLoading: eventsLoading } = useGetAllEventsQuery();

  const [usersCount, setUsersCount] = useState(0);
  const [externalSchoolsCount, setExternalSchoolsCount] = useState(0);
  const [exercisesCount, setExercisesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    if (usersData) {
      const counts = usersData.reduce((acc, user) => {
        const type = user.role || 'Neznáme';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(counts).map(([type, count]) => ({
        name: type,
        value: count
      }));

      setUserRolesData(formattedData);
    }
  }, [usersData]);

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
    if (!eventsLoading && eventsData) {
      setEventsCount(eventsData.length);
    }
  }, [
    usersData,
    externalSchoolsData,
    exercisesData,
    usersLoading,
    externalSchoolsLoading,
    exercisesLoading,
    eventsData,
    eventsLoading
  ]);

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Prehľad štatistík
      </Typography>

      {/* Statistics Section */}
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

        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Celkový počet špeciálnych cvičení
            </Typography>
            {exercisesLoading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h4">{eventsCount}</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ width: '100%', height: 300, mb: 5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: 'Používatelia', počet: usersCount },
              { name: 'Externé školy', počet: externalSchoolsCount },
              { name: 'Cvičenia', počet: exercisesCount },
              { name: 'Špec. cvičenia', počet: eventsCount }
            ]}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="počet" fill="#1976d2" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ width: '100%', height: 300, mt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Rozdelenie používateľov podľa typu
        </Typography>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={userRolesData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {userRolesData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={['#1976d2', '#f50057', '#00c853', '#ff9100', '#6a1b9a'][index % 5]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Users List Section */}
      <Box sx={{ mt: 5 }}>
        <UsersList /> {/* Users table component */}
      </Box>

      {/* External Schools Section */}
      <Box sx={{ mt: 5 }}>
        <ExternalSchools /> {/* External schools table component */}
      </Box>

      {/* Additional Information */}
      <Box sx={{ mt: 4 }}>
        <Exercises />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Events />
      </Box>
    </Container>
  );
};

export default Dashboard;
