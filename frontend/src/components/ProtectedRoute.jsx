import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  if (!isTokenValid()) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default ProtectedRoute;
