import { useCreateUserMutation, useGetAllExternalSchoolsQuery } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createUserSchema } from '../schemas/createUser.schema';

const AddUserModal = () => {
  const [open, setOpen] = useState(false);
  const { data: externalSchools = [], isLoading: isLoadingSchools } =
    useGetAllExternalSchoolsQuery();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createUserSchema),
    defaultValues: { role: '' }
  });

  const selectedRole = watch('role');

  // Handle dynamic validation for externalSchool when role is 'Externý učiteľ'
  useEffect(() => {
    if (selectedRole === 'Externý učiteľ') {
      setValue('externalSchool', null); // Reset externalSchool when role changes
    }
  }, [selectedRole, setValue]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSubmit = async (data) => {
    console.log(data);

    // Validation for externalSchool based on role
    if (data.role === 'Externý učiteľ' && !data.externalSchool) {
      toast.error('Prosím, vyberte externú školu');
      return;
    }

    // Ensure externalSchool is sent as a Mongoose ObjectId if valid
    const payload = {
      ...data,
      ...(data.externalSchool && { externalSchool: data.externalSchool }) // Only include if it's valid
    };

    // Send the request
    const response = await createUser(payload);

    if (!response.error) {
      toast.success('Užívateľ bol úspešne pridaný');
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

          {/* Select Field for Role */}
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Rola</InputLabel>
            <Controller
              name="role"
              control={control}
              defaultValue=""
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <Select {...field} fullWidth>
                  <MenuItem value={'Externý učiteľ'}>Externý učiteľ</MenuItem>
                  <MenuItem value={'Zamestnanec UNIZA'}>Zamestnanec UNIZA</MenuItem>
                  <MenuItem value={'Správca cvičení'}>Správca cvičení</MenuItem>
                </Select>
              )}
            />
            {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
          </FormControl>

          {/* External School Dropdown (Only if role is 'Externý učiteľ') */}
          {selectedRole === 'Externý učiteľ' && (
            <FormControl fullWidth error={!!errors.externalSchool}>
              <InputLabel>Externá škola</InputLabel>
              <Controller
                name="externalSchool"
                control={control}
                rules={{ required: 'Externá škola je povinná' }}
                render={({ field }) => (
                  <Select {...field} fullWidth disabled={isLoadingSchools}>
                    {externalSchools.map((school) => (
                      <MenuItem key={school._id} value={school._id}>
                        {school.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.externalSchool && (
                <FormHelperText>{errors.externalSchool.message}</FormHelperText>
              )}
            </FormControl>
          )}

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
