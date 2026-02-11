import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [role, setRole] = useState('customer');
  const [recaptchaToken, setRecaptchaToken] = useState('test-recaptcha-token');
  const [sessionInfo, setSessionInfo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setMessage('');
    try {
      const response = await authApi.signupPhone({ phoneNumber, recaptchaToken, role });
      setSessionInfo(response.data.data.sessionInfo);
      setMessage('OTP sent. Please verify using OTP code.');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    setError('');
    setMessage('');
    try {
      const response = await authApi.verifyOtp({ sessionInfo, otpCode, role });
      loginWithTokens(response.data.data.tokens, response.data.data.user);

      if (role === 'driver') navigate('/driver/dashboard');
      else if (role === 'admin') navigate('/admin/pricing');
      else navigate('/customer/book');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'OTP verification failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            LoadEx Login
          </Typography>
          <Stack spacing={2}>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
            <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="driver">Driver</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="reCAPTCHA Token"
              value={recaptchaToken}
              onChange={(e) => setRecaptchaToken(e.target.value)}
              helperText="For production, set this from Firebase web/mobile verification flow"
            />
            <Button variant="contained" onClick={sendOtp}>
              Send OTP
            </Button>
            <TextField
              label="Session Info"
              value={sessionInfo}
              onChange={(e) => setSessionInfo(e.target.value)}
            />
            <TextField label="OTP Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
            <Button variant="contained" color="secondary" onClick={verifyOtp}>
              Verify OTP & Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
