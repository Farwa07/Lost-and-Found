import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const enteredEmail = normalizeEmail(email);

    if (!emailRegex.test(enteredEmail)) {
      setMessage({ type: "error", text: "Enter valid email address." });
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ email: enteredEmail });
      setMessage({
        type: "success",
        text: "Password reset link has been sent to your email. Please open that link to set a new password.",
      });
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Reset link could not be sent.",
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
            <h1>Reset Password</h1>
            <p>
              Enter your registered email and we will send a secure password
              reset link.
            </p>
          </div>
        </div>
      </div>

      <div className="forgot__right">
        <div className="forgot__card">
          <h2>Forgot Password?</h2>

          <p className="forgot__subtitle">
            No worries, enter your registered email to reset your password.
          </p>

          {message.text && (
            <div className={`forgot__message forgot__message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="forgot__form" onSubmit={handleEmailSubmit}>
            <div className="forgot__field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage({ type: "", text: "" });
                }}
                required
              />
            </div>

            <button className="forgot__btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="forgot__bottom">
            Remembered password? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
