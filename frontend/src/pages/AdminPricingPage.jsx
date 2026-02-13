import { useState } from 'react';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { pricingApi } from '../api/pricingApi';

const AdminPricingPage = () => {
  const [vehicleType, setVehicleType] = useState('mini_truck');
  const [baseFare, setBaseFare] = useState('200');
  const [perKmRate, setPerKmRate] = useState('18');
  const [surgeMultiplier, setSurgeMultiplier] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const savePricing = async () => {
    setMessage('');
    setError('');

    try {
      const payload = {
        baseFare: Number(baseFare),
        perKmRate: Number(perKmRate),
        surgeMultiplier: Number(surgeMultiplier)
      };
      await pricingApi.updatePricing(vehicleType, payload);
      setMessage('Pricing rule updated successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to update pricing');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Admin Pricing Management
        </Typography>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
          <TextField label="Base Fare" value={baseFare} onChange={(e) => setBaseFare(e.target.value)} />
          <TextField label="Per KM Rate" value={perKmRate} onChange={(e) => setPerKmRate(e.target.value)} />
          <TextField
            label="Surge Multiplier"
            value={surgeMultiplier}
            onChange={(e) => setSurgeMultiplier(e.target.value)}
          />
          <Button variant="contained" onClick={savePricing}>
            Save Pricing Rule
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AdminPricingPage;
