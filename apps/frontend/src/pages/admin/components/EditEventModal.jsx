import { useEditEventMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Changed from DateTimePicker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { editEventSchema } from '../schemas/event.schema';

const EditEventModal = ({ open, onClose, eventData }) => {
  const [editEvent, { isLoading }] = useEditEventMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(editEventSchema),
    defaultValues: {
      name: '',
      datefrom: null,
      dateto: null,
      dateClosing: null
    }
  });

  useEffect(() => {
    if (eventData) {
      reset({
        name: eventData.name || '',
        datefrom: eventData.datefrom ? new Date(eventData.datefrom) : null,
        dateto: eventData.dateto ? new Date(eventData.dateto) : null,
        dateClosing: eventData.dateClosing ? new Date(eventData.dateClosing) : null
      });
    }
  }, [eventData, reset]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      // Format dates as YYYY-MM-DD without time
      datefrom: data.datefrom ? dayjs(data.datefrom).format('YYYY-MM-DD') : null,
      dateto: data.dateto ? dayjs(data.dateto).format('YYYY-MM-DD') : null,
      dateClosing: data.dateClosing ? dayjs(data.dateClosing).format('YYYY-MM-DD') : null
    };

    try {
      const response = await editEvent({ Id: eventData._id, ...formattedData });

      if (!response.error) {
        toast.success('Udalosť bola úspešne upravená');
        onClose();
        reset();
      } else {
        toast.error('Chyba pri úprave udalosti');
      }
    } catch (error) {
      toast.error(error.message || 'Chyba pri úprave udalosti');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Uprav udalosť</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '30rem' }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                label="Názov"
                {...field}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="datefrom"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Dátum začiatku"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.datefrom,
                    helperText: errors.datefrom?.message,
                    fullWidth: true
                  }
                }}
              />
            )}
          />

          <Controller
            name="dateto"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Dátum konca"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.dateto,
                    helperText: errors.dateto?.message,
                    fullWidth: true
                  }
                }}
              />
            )}
          />

          <Controller
            name="dateClosing"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Uzávierka"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    error: !!errors.dateClosing,
                    helperText: errors.dateClosing?.message,
                    fullWidth: true
                  }
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="error" variant="outlined">
            Zruš
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Ulož
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

EditEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  eventData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    datefrom: PropTypes.string,
    dateto: PropTypes.string,
    dateClosing: PropTypes.string
  }).isRequired
};

export default EditEventModal;
