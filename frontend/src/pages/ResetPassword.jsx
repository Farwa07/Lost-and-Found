import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(passwordData.newPassword)) {
      setMessage({
        type: "error",
        text: "Password must contain uppercase, lowercase, number, special character and minimum 8 characters.",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, { newPassword: passwordData.newPassword });
      setMessage({
        type: "success",
        text: "Password reset successfully. Please login with your new password.",
      });

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Password reset failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot">
      <div className="forgot__left">
        <div className="forgot__overlay">
          <div className="forgot__content">
            <h1>Create New Password</h1>
            <p>Set a strong new password to secure your Lost & Found account.</p>
          </div>
        </div>
      </div>

      <div className="forgot__right">
        <div className="forgot__card">
          <h2>Set New Password</h2>
          <p className="forgot__subtitle">Enter and confirm your new password.</p>

          {message.text && (
            <div className={`forgot__message forgot__message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="forgot__form" onSubmit={handlePasswordSubmit}>
            <div className="forgot__field">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="forgot__field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button className="forgot__btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Reset Password"}
            </button>
          </form>

          <p className="forgot__bottom">
            Back to <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
