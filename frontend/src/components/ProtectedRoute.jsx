import { Navigate } from "react-router-dom";
import getUserId from "../utils/getUserId";

const ProtectedRoute = ({ children }) => {
  const userId = getUserId();

  if (!userId) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
