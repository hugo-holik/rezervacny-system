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
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createEventSchema } from '../schemas/event.schema';

const AddEventModal = ({ open, onClose }) => {
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createEventSchema),
    defaultValues: {
      name: '',
      datefrom: '',
      dateto: '',
      dateClosing: ''
    }
  });


  const formatDate = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0'); // pridanie nuly pre dni a mesiace menej ako 10
    return `${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  
  const onSubmit = async (data) => {
  const formattedData = {
    ...data,
    datefrom: formatDate(data.datefrom),
    dateto: formatDate(data.dateto),
    dateClosing: formatDate(data.dateClosing),
  };

  const response = await createEvent(formattedData);

  if (!response.error) {
    toast.success('Udalosť bola úspešne pridaná');
    onClose();
    reset();
  } else {
    toast.error('Chyba pri pridávaní udalosti');
  }
  };

  return (
    <Dialog open={open} onClose={onClose} component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>Pridaj udalosť</DialogTitle>
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
          Pridaj
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AddEventModal;
