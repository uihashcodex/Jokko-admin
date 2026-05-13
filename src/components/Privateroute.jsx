import { Navigate, Outlet } from "react-router-dom";
import { constant } from "../const";

const PrivateRoute = () => {
  const token = localStorage.getItem("adminToken");
  return token ? (
    <Outlet />
  ) : (
    <Navigate to={`/${constant.adminRoute}`} replace />
  );
};

export default PrivateRoute;