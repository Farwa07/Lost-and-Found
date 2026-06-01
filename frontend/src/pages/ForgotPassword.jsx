import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    console.log("Password reset email:", email);

    setMessage({
      type: "success",
      text: "Password reset link has been sent to your email.",
    });

    setEmail("");
  };

  return (
    <div className="forgot">
      {/* LEFT SIDE */}

      <div className="forgot__left">
        <div className="forgot__overlay">
          <div className="forgot__content">
            <h1>Reset Password</h1>

            <p>
              Enter your registered email and we will help you recover your
              account safely.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="forgot__right">
        <div className="forgot__card">
          <h2>Forgot Password?</h2>

          <p className="forgot__subtitle">
            No worries, enter your email to reset your password
          </p>

          {message.text && (
            <div className={`forgot__message forgot__message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="forgot__form" onSubmit={handleSubmit}>
            <div className="forgot__field">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
                required
              />
            </div>

            <button className="forgot__btn" type="submit">
              Send Reset Link
            </button>
          </form>

          <p className="forgot__bottom">
            Remember your password?

            <span onClick={() => navigate("/login")}> Back to Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}