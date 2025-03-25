import ErrorNotifier from '@app/components/ErrorNotifier';
import { useUpdateUserMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateUserSchema } from '../schemas/createUser.schema';

const EditUserModal = ({ userData }) => {
  const [open, setOpen] = React.useState(false);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(updateUserSchema),
    defaultValues: {
      name: userData.name || '',
      surname: userData.surname || '',
      email: userData.email || '',
      role: userData.role || 'Zamestnanec', // Set default role
      isAdmin: userData.isAdmin || false,
      isActive: userData.isActive || false
    }
  });

  const handleClickOpen = () => {
    setValue('name', userData.name);
    setValue('role', userData.role || 'Zamestnanec'); // Set role on open
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    const response = await updateUser({ data, userId: userData._id });
    if (!response.error) {
      toast.success('Užívateľ bol úspešne aktualizovaný');
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Uprav používateľa">
        <IconButton onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mx: 'auto',
            minWidth: { md: '30rem' }
          }}
        >
          <DialogTitle>Uprav používateľa</DialogTitle>

          <TextField
            label="Name"
            variant="outlined"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <TextField
            label="Surname"
            variant="outlined"
            {...register('surname')}
            error={!!errors.surname}
            helperText={errors.surname?.message}
            fullWidth
          />

          <TextField
            label="Email"
            variant="outlined"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          {/* Role Dropdown */}
          <Controller
            name="role"
            control={control}
            defaultValue="Externý učiteľ"
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <Select {...field} fullWidth>
                <MenuItem value={'Externý učiteľ'}>Externý učiteľ</MenuItem>
                <MenuItem value={'Zamestnanec UNIZA'}>Zamestnanec UNIZA</MenuItem>
                <MenuItem value={'Správca cvičení'}>Správca cvičení</MenuItem>
              </Select>
            )}
          />
          {errors.role && <Typography color="error">{errors.role.message}</Typography>}

          <Controller
            name="isAdmin"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Is Admin"
              />
            )}
          />
          {errors.isAdmin && <Typography color="error">{errors.isAdmin.message}</Typography>}

          <Controller
            name="isActive"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Účet aktívny"
              />
            )}
          />
          {errors.isActive && <Typography color="error">{errors.isActive.message}</Typography>}

          <ErrorNotifier />

          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button type="submit" variant="outlined" disabled={isLoading}>
              Uprav
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

EditUserModal.propTypes = {
  userData: PropTypes.object.isRequired
};

export default EditUserModal;
