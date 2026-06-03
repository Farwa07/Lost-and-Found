import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isRegistered } = useAuth();

  if (!isLoggedIn) {
    alert(
      isRegistered
        ? "Please login to access this page."
        : "Please create an account to access this page."
    );

    return (
      <Navigate
        to={isRegistered ? "/login" : "/signup"}
        replace
      />
    );
  }

  return children;
}