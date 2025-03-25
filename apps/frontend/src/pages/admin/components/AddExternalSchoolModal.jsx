import React from 'react';

import { useCreateExternalSchoolMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createExternalSchoolSchema } from '../schemas/externalSchool.schema';

const AddExternalSchoolModal = () => {
  const [open, setOpen] = React.useState(false);
  const [createExternalSchool, { isLoading }] = useCreateExternalSchoolMutation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createExternalSchoolSchema)
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
    const response = await createExternalSchool(data);
    if (!response.error) {
      toast.success('Externá škola bola úspešne pridaná');
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
        Pridaj externú školu
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
          <DialogTitle>Pridaj externú školu</DialogTitle>
          <TextField
            label="Name"
            variant="outlined"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <TextField
            label="address"
            variant="outlined"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
            fullWidth
          />

          <TextField
            label="contactPerson"
            variant="outlined"
            {...register('contactPerson')}
            error={!!errors.contactPerson}
            helperText={errors.contactPerson?.message}
            fullWidth
          />

          <TextField
            label="telNumber"
            variant="outlined"
            {...register('telNumber')}
            error={!!errors.telNumber}
            helperText={errors.telNumber?.message}
            fullWidth
          />

          {/* <FormControlLabel control={<Checkbox {...register('isAdmin')} />} label="Is Admin" />
          {errors.isAdmin && <Typography color="error">{errors.isAdmin.message}</Typography>}
          <ErrorNotifier /> */}

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

export default AddExternalSchoolModal;
