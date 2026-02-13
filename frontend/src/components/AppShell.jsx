import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            LoadEx
          </Typography>
          {user?.role === 'customer' && (
            <Button color="inherit" component={RouterLink} to="/customer/book">
              Book
            </Button>
          )}
          {user?.role === 'customer' && (
            <Button color="inherit" component={RouterLink} to="/customer/history">
              History
            </Button>
          )}
          {user?.role === 'driver' && (
            <Button color="inherit" component={RouterLink} to="/driver/dashboard">
              Driver
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button color="inherit" component={RouterLink} to="/admin/pricing">
              Pricing
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AppShell;
