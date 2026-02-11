import { useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { bookingApi } from '../api/bookingApi';

const CustomerBookingPage = () => {
  const [pickupLat, setPickupLat] = useState('19.0760');
  const [pickupLng, setPickupLng] = useState('72.8777');
  const [dropLat, setDropLat] = useState('19.2183');
  const [dropLng, setDropLng] = useState('72.9781');
  const [vehicleType, setVehicleType] = useState('mini_truck');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const createBooking = async () => {
    setError('');
    try {
      const payload = {
        pickupLocation: { lat: Number(pickupLat), lng: Number(pickupLng) },
        dropLocation: { lat: Number(dropLat), lng: Number(dropLng) },
        vehicleType
      };

      const apiResponse = await bookingApi.createBooking(payload);
      setResponse(apiResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to create booking');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create Booking
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {response && <Alert severity="success">Booking created: {response.id}</Alert>}
          <TextField label="Pickup Lat" value={pickupLat} onChange={(e) => setPickupLat(e.target.value)} />
          <TextField label="Pickup Lng" value={pickupLng} onChange={(e) => setPickupLng(e.target.value)} />
          <TextField label="Drop Lat" value={dropLat} onChange={(e) => setDropLat(e.target.value)} />
          <TextField label="Drop Lng" value={dropLng} onChange={(e) => setDropLng(e.target.value)} />
          <TextField
            label="Vehicle Type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            helperText="mini_truck | pickup | tempo | truck"
          />
          <Button variant="contained" onClick={createBooking}>
            Submit Booking
          </Button>
          {response && <pre style={{ overflow: 'auto' }}>{JSON.stringify(response, null, 2)}</pre>}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerBookingPage;
