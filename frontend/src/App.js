import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/ProfilePage/Profile";
import Onboarding from "./pages/OnboardingPage/Onboarding";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout/Layout";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import PaymentReturn from "./pages/PaymentReturn";
import ProtectedRoute from "./components/ProtectedRoute";
import ContactUs from "./pages/ContactUs/ContactUs";
import { isTokenValid } from "./utils/auth";

function App() {
  const isLoggedIn = isTokenValid();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/appointments/book" element={<BookAppointment />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
