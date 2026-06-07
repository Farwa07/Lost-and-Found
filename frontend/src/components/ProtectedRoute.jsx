import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  adminOnly = false,
  allowedRole = "",
}) {
  const location = useLocation();

  const { isLoggedIn, isRegistered, currentUser, isAdmin } = useAuth();

  if (!isRegistered && !isLoggedIn) {
    return (
      <Navigate
        to="/signup"
        replace
        state={{
          from: location.pathname,
          message: "Please create an account first.",
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please login first.",
        }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
          message: "Only admin can access this page.",
        }}
      />
    );
  }

  if (
    allowedRole &&
    String(currentUser?.role || "").toLowerCase() !==
      String(allowedRole).toLowerCase()
  ) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
          message: "You are not allowed to access this page.",
        }}
      />
    );
  }

  return children;
}