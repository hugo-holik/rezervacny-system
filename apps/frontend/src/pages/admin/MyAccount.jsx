import { useChangeUserPasswordMutation, useGetUserMeQuery } from '@app/redux/api';
import { Box, Button, Card, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

const MyAccount = () => {
  const { data: user, isLoading: isUserLoading } = useGetUserMeQuery();
  const [changeUserPassword, { isLoading: isPasswordChanging }] = useChangeUserPasswordMutation();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return;
    }

    try {
      await changeUserPassword({
        password: formData.newPassword
      }).unwrap();

      toast.success('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.data?.fields) {
        // Handle field-specific errors
        setErrors(error.data.fields);
      }

      // Show all error messages
      const errorMessages = error.data?.messages || ['Failed to change password'];
      errorMessages.forEach((msg) => toast.error(msg));
    }
  };

  if (isUserLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        My Account
      </Typography>
      <Card sx={{ mt: '10%', p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Change Password
        </Typography>
        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            label="Current Password"
            name="currentPassword"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.currentPassword}
            onChange={handleChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isPasswordChanging}>
            {isPasswordChanging ? 'Changing password...' : 'Change Password'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default MyAccount;
