import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import CustomerBookingPage from './pages/CustomerBookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import AdminPricingPage from './pages/AdminPricingPage';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <PrivateRoute>
          <AppShell />
        </PrivateRoute>
      }
    >
      <Route path="/customer/book" element={<PrivateRoute roles={['customer']}><CustomerBookingPage /></PrivateRoute>} />
      <Route path="/customer/history" element={<PrivateRoute roles={['customer']}><BookingHistoryPage /></PrivateRoute>} />
      <Route path="/driver/dashboard" element={<PrivateRoute roles={['driver']}><DriverDashboardPage /></PrivateRoute>} />
      <Route path="/admin/pricing" element={<PrivateRoute roles={['admin']}><AdminPricingPage /></PrivateRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
