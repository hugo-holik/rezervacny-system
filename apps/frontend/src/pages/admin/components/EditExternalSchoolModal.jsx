import React from 'react';

import { useEditExternalSchoolMutation } from '@app/redux/api';
import EditIcon from '@mui/icons-material/Edit';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { editExternalSchoolSchema } from '../schemas/externalSchool.schema';
const EditExternalSchoolModal = ({ externalSchoolData }) => {
  const [open, setOpen] = React.useState(false);
  const [editExternalSchool, { isLoading }] = useEditExternalSchoolMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(editExternalSchoolSchema),
    defaultValues: {
      name: externalSchoolData.name || '',
      address: externalSchoolData.address || '',
      contactPerson: externalSchoolData.contactPerson || '',
      telNumber: externalSchoolData.telNumber || ''
    }
  });

  const handleClickOpen = () => {
    setValue('name', externalSchoolData.name);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (formData) => {
    const payload = { ...formData, Id: externalSchoolData._id }; // Ensure Id is included
    const response = await editExternalSchool(payload);
    if (!response.error) {
      toast.success('Externá škola bola úspešne aktualizovaná');
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Uprav používateľa" key={'edit'}>
        <IconButton onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
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
            label="Address"
            variant="outlined"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
            fullWidth
          />

          <TextField
            label="Contact Person"
            variant="outlined"
            {...register('contactPerson')}
            error={!!errors.contactPerson}
            helperText={errors.contactPerson?.message}
            fullWidth
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

EditExternalSchoolModal.propTypes = {
  externalSchoolData: PropTypes.object.isRequired // Specify that `value` is a required string
};

export default EditExternalSchoolModal;
