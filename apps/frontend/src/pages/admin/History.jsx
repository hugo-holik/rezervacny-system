import { Box, Typography } from '@mui/material';
import { Tabs, Tab, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';

import {
  useGetUsersListQuery,
  useGetAllExercisesQuery,
  useGetAllEventsQuery,
  useGetApplicationsQuery,
  useGetAllExternalSchoolsQuery
} from '@app/redux/api';

const History = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const { data: users = [], isLoading: usersLoading } = useGetUsersListQuery();
  const { data: exercises = [], isLoading: exercisesLoading } = useGetAllExercisesQuery();
  const { data: events = [], isLoading: eventsLoading } = useGetAllEventsQuery();
  const { data: applications = [], isLoading: applicationsLoading } = useGetApplicationsQuery();
  const { data: schools = [], isLoading: schoolsLoading } = useGetAllExternalSchoolsQuery();


  const isAnyLoading =
    usersLoading || exercisesLoading || eventsLoading /*|| applicationsLoading */|| schoolsLoading;

    const tabs = [
      {
        label: 'Používatelia',
        rows: users,
        columns: [
          { field: 'email', headerName: 'Email', flex: 1 },
          { field: 'role', headerName: 'Rola', flex: 1 },
          {
            field: 'createdAt',
            headerName: 'Vytvorený',
            flex: 1,
            valueGetter: (params) => {
              const dateStr = params.row?.createdAt;
              return dateStr
                ? new Date(dateStr).toLocaleDateString('sk-SK', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'N/A';
            },
          },          
        ],
      },
      {
        label: 'Cvičenia',
        rows: exercises,
        columns: [
          { field: 'name', headerName: 'Názov', flex: 1 },
          { field: 'description', headerName: 'Popis', flex: 1 },
        ],
      },
      {
        label: 'Udalosti',
        rows: events,
        columns: [
          { field: 'name', headerName: 'Názov', flex: 1 },
        ],
      },/*
      {
        label: 'Prihlášky',
        rows: applications,
        columns: [
          { field: '_id', headerName: 'ID', flex: 1 },
          {
            field: 'user',
            headerName: 'Používateľ',
            flex: 1,
            valueGetter: (params) => params.row?.user?.name || '-',
          },
        ],
      },*/
      {
        label: 'Školy',
        rows: schools,
        columns: [
          { field: 'name', headerName: 'Názov školy', flex: 1 },
        ],
      },
    ];
    

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const currentTab = tabs[tabIndex];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        História
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>

      {isAnyLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={currentTab.rows
            .filter((item) => !!item && !!item._id)
            .map((item) => ({
              ...item,
              id: item._id, // zachováme všetky ostatné polia vrátane createdAt
            }))}
          columns={currentTab.columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
        />
        </Box>
      )}
    </Box>
  );
};

export default History;
