import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/ProfilePage/Profile";
import Onboarding from "./pages/OnboardingPage/Onboarding";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout/Layout";
import Appointments from "./pages/Appointments";
import Therapy from "./pages/Therapy";
import Resources from "./pages/Resources";

// const ProtectedRoute = ({ children }) => {
//   const isLoggedIn = !!localStorage.getItem("access_token");

//   if (!isLoggedIn) {
//     return <Navigate to="/auth" replace />;
//   }

//   return children;
// };

function App() {

  const isLoggedIn = !!localStorage.getItem("access_token");

  return (
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        element={
          // <ProtectedRoute>
            <Layout />
          /* </ProtectedRoute> */
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/therapy" element={<Therapy />} />
        <Route path="/resources" element={<Resources />} />
      </Route>

      {/* Catch-all: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
