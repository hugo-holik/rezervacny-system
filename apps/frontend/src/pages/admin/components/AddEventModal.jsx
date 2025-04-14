import { useCreateEventMutation } from '@app/redux/api';
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createEventSchema } from '../schemas/event.schema';

const AddEventModal = ({ open, onClose }) => {
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createEventSchema),
    defaultValues: {
      name: '',
      datefrom: null,
      dateto: null,
      dateClosing: null
    }
  });

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    // data.datefrom, dateto, dateClosing are now native Date objects
    const formData = {
      ...data,
      datefrom: data.datefrom ? data.datefrom.toISOString() : null,
      dateto: data.dateto ? data.dateto.toISOString() : null,
      dateClosing: data.dateClosing ? data.dateClosing.toISOString() : null
    };

    try {
      const response = await createEvent(formData);
      if (!response.error) {
        toast.success('Udalosť bola úspešne pridaná');
        onClose();
        reset();
      } else {
        toast.error('Chyba pri pridávaní udalosti');
      }
    } catch (error) {
      toast.error(error.message || 'Chyba pri pridávaní udalosti');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Pridaj udalosť</DialogTitle>
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
              <DateTimePicker
                label="Dátum začiatku"
                {...field}
                // Convert the current value into a Dayjs object for the picker.
                value={field.value ? dayjs(field.value) : null}
                // Convert the selected Dayjs value to a native Date object.
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                slotProps={{
                  textField: {
                    error: !!errors.datefrom,
                    helperText: errors.datefrom?.message
                  }
                }}
              />
            )}
          />
          <Controller
            name="dateto"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Dátum konca"
                {...field}
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                slotProps={{
                  textField: {
                    error: !!errors.dateto,
                    helperText: errors.dateto?.message
                  }
                }}
              />
            )}
          />
          <Controller
            name="dateClosing"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Uzávierka"
                {...field}
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => field.onChange(newValue ? newValue.toDate() : null)}
                slotProps={{
                  textField: {
                    error: !!errors.dateClosing,
                    helperText: errors.dateClosing?.message
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
            Pridaj
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

AddEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddEventModal;
