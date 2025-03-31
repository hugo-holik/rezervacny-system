import * as authService from '@app/pages/auth/authService';
import { useGetUserMeQuery, useUpdateUserMutation } from '@app/redux/api';
import { Box, Button, Card, Container, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const MyAccount = () => {
  // Fetch the current user from the API
  const { data: user, isLoading: isUserLoading } = useGetUserMeQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });

  // Set form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Chyba: Nie je možné načítať používateľa.');
      return;
    }

    const updatedData = {
      name: formData.name,
      surname: user.surname, // Required but not editable
      email: user.email, // Required but not editable
      role: user.role, // Required but not editable
      isAdmin: user.isAdmin, // Required but not editable
      isActive: user.isActive, // Required but not editable
      ...(formData.password && { password: formData.password }) // Include password only if provided
    };
    console.log('Updated data:', updatedData);
    try {
      const response = await updateUser({
        userId: user._id,
        data: updatedData
      }).unwrap();

      // Update local storage with new name
      const updatedUser = { ...user, name: response.name };
      authService.saveUserToStorage(updatedUser);

      toast.success('Údaje boli úspešne aktualizované');
    } catch (error) {
      toast.error('Chyba pri aktualizácii: ' + (error?.data?.message || 'Neznáma chyba'));
    }
  };

  if (isUserLoading) {
    return <Typography>Načítava sa...</Typography>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        Môj účet
      </Typography>
      <Card sx={{ mt: '10%', p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Meno"
            name="name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nové heslo"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isUpdating}>
            Aktualizovať údaje
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default MyAccount;
