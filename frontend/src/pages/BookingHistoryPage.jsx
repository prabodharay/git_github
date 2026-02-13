import { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { bookingApi } from '../api/bookingApi';

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingApi.listBookings();
        setBookings(response.data.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Unable to load bookings');
      }
    };

    load();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Booking History
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {!bookings.length ? (
          <Typography variant="body2">No bookings yet.</Typography>
        ) : (
          <List>
            {bookings.map((booking) => (
              <ListItem key={booking.id} divider>
                <ListItemText
                  primary={`Booking #${booking.id}`}
                  secondary={`Vehicle: ${booking.vehicleType} | Fare: ₹${booking.fare}`}
                />
                <Stack alignItems="flex-end" spacing={1}>
                  <Chip label={booking.status} color="primary" variant="outlined" size="small" />
                  <Typography variant="caption">{booking.createdAt}</Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingHistoryPage;
