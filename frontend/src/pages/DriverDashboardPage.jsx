import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { bookingApi } from '../api/bookingApi';
import { apiClient } from '../api/client';

const DriverDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    try {
      const response = await bookingApi.listBookings();
      setBookings(response.data.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to fetch assigned bookings');
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (bookingId, status) => {
    setError('');
    try {
      await apiClient.patch(`/bookings/${bookingId}/status`, { status });
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Status update failed');
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Driver Dashboard</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent>
            <Typography variant="subtitle1">Booking #{booking.id}</Typography>
            <Typography variant="body2">Current: {booking.status}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {['accepted', 'arrived', 'started', 'completed'].map((status) => (
                <Button key={status} size="small" variant="outlined" onClick={() => updateStatus(booking.id, status)}>
                  {status}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default DriverDashboardPage;
