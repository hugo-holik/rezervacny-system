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
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { editEventSchema } from '../schemas/event.schema';

const EditEventModal = ({ open, onClose, eventData }) => {
  const [editEvent, { isLoading }] = useEditEventMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(editEventSchema),
    defaultValues: {
      name: '',
      datefrom: '',
      dateto: '',
      dateClosing: ''
    }
  });

  useEffect(() => {
    if (eventData) {
      reset({
        name: eventData.name || '',
        datefrom: eventData.datefrom ? formatDateTimeForInput(eventData.datefrom) : '',
        dateto: eventData.dateto ? formatDateTimeForInput(eventData.dateto) : '',
        dateClosing: eventData.dateClosing ? formatDateTimeForInput(eventData.dateClosing) : ''
      });
    }
  }, [eventData, reset]);

  const formatDateTimeForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const onSubmit = async (data) => {
    const response = await editEvent({ Id: eventData._id, ...data });
    if (!response.error) {
      toast.success('Udalosť bola úspešne upravená');
      onClose();
    } else {
      toast.error('Chyba pri úprave udalosti');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>Uprav udalosť</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '30rem' }}>
        <TextField
          label="Názov"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="Dátum začiatku"
          type="datetime-local"
          {...register('datefrom')}
          error={!!errors.datefrom}
          helperText={errors.datefrom?.message}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Dátum konca"
          type="datetime-local"
          {...register('dateto')}
          error={!!errors.dateto}
          helperText={errors.dateto?.message}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Uzávierka"
          type="datetime-local"
          {...register('dateClosing')}
          error={!!errors.dateClosing}
          helperText={errors.dateClosing?.message}
          InputLabelProps={{ shrink: true }}
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
