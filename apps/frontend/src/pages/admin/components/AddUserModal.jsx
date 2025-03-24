import React from 'react';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { useCreateUserMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createUserSchema } from '../schemas/createUser.schema';

const AddUserModal = () => {
  const [open, setOpen] = React.useState(false);
  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createUserSchema)
    // defaultValues: {
    //   name: 'John Doe',
    //   surname: 'asa',
    //   email: 'aa@aa.aa',
    //   password: 'heslo1234',
    //   passwordConfirmation: 'heslo1234',
    //   isAdmin: false
    // }
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    const response = await createUser(data);
    if (!response.error) {
      toast.success('Uzivatel bol uspesne pridany');
      handleClose();
    }
  };

  return (
    <>
      <Button
        sx={{ m: 1, minWidth: '15rem' }}
        variant="contained"
        onClick={handleClickOpen}
        fullWidth
      >
        Pridaj používateľa
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        component={'form'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mx: 'auto',
            minWidth: {
              md: '30rem'
            }
          }}
        >
          <DialogTitle>Pridaj používateľa</DialogTitle>
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

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />

          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            {...register('passwordConfirmation')}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
            fullWidth
          />
          <FormControlLabel control={<Checkbox {...register('isAdmin')} />} label="Is Admin" />
          {errors.isAdmin && <Typography color="error">{errors.isAdmin.message}</Typography>}
          <ErrorNotifier />

          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button type="submit" variant="outlined" disabled={isLoading}>
              Pridaj
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserModal;
