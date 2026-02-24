import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;