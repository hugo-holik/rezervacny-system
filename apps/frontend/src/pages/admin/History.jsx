import { useGetApplicationsHistoryQuery } from '@app/redux/api';import { Box, Grid, Paper, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';

const History = () => {
  const { data, isLoading } = useGetApplicationsHistoryQuery();

  const columns = [
    { 
      field: 'exerciseName',
      headerName: 'Názov cvičenia',
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'numOfAttendees',
      headerName: 'Počet účastníkov',
      flex: 1 
    },
    { 
      field: 'date',
      headerName: 'Dátum',
      flex: 1,
      valueFormatter: (params) => formatDate(params, 'dd.MM.yyyy HH:mm')
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

  const handleRowClick = (params) => {
    //NOTE ak chceme na dvojklik nejaku aktivitu
    console.log(params);
  };

  return (
    <Box py={2}>
      <Grid py={1} px={1} container spacing={1}>
        <Grid size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            História
          </Typography>
        </Grid>
      </Grid>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data}
          columns={columns}
          getRowId={(row) => row.exerciseId}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'standard',
            pagination: {
              paginationModel: {
                pageSize: 20
              }
            }
          }}
          isRowSelectable={() => false}
          slots={{
            toolbar: GridToolbar
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          ignoreDiacritics
          onRowDoubleClick={(params) => {
            handleRowClick(params);
          }}
        />
      </Paper>
    </Box>
  );
};

const formatDate = (dateString, formatString) => {
    try {
      return dateString ? format(new Date(dateString), formatString) : 'N/A';
    } catch {
      return 'Invalid Date';
    }
};

export default History;