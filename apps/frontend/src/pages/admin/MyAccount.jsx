'use client';

import { useChangeUserPasswordMutation, useGetUserMeQuery } from '@app/redux/api';
import { Box, Button, Card, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

const MyAccount = () => {
  const { isLoading: isUserLoading } = useGetUserMeQuery();
  const [changeUserPassword, { isLoading: isPasswordChanging }] = useChangeUserPasswordMutation();

  const [formData, setFormData] = useState({
    password_old: '',
    password_new: '',
    password_new_repeat: ''
  });

  const [errors, setErrors] = useState({
    password_old: '',
    password_new: '',
    password_new_repeat: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      password_old: '',
      password_new: '',
      password_new_repeat: ''
    });

    // Frontend validation
    if (formData.password_new !== formData.password_new_repeat) {
      setErrors((prev) => ({
        ...prev,
        password_new_repeat: 'Passwords do not match'
      }));
      return;
    }

    try {
      await changeUserPassword(formData).unwrap();
      toast.success('Password changed successfully!');
      setFormData({
        password_old: '',
        password_new: '',
        password_new_repeat: ''
      });
    } catch (error) {
      console.error('Password change error:', error);

      if (error.fields) {
        // Handle field-specific errors
        setErrors(error.fields);
      }

      // Show all error messages
      const errorMessages = error.messages || ['Failed to change password'];
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
            name="password_old"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password_old}
            onChange={handleChange}
            error={!!errors.password_old}
            helperText={errors.password_old}
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            name="password_new"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password_new}
            onChange={handleChange}
            error={!!errors.password_new}
            helperText={errors.password_new}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            name="password_new_repeat"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password_new_repeat}
            onChange={handleChange}
            error={!!errors.password_new_repeat}
            helperText={errors.password_new_repeat}
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
