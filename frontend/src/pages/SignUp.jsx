import "./SignUp.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendSignupOtp } from "../api/authApi";

const defaultAdminEmail = "admin@lostfound.com";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    const cleanEmail = normalizeEmail(formData.email);

    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Please enter your full name." });
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (cleanEmail === normalizeEmail(defaultAdminEmail)) {
      setMessage({
        type: "error",
        text: "This email is reserved for admin. Please use another email.",
      });
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: "error", text: "Please enter a valid phone number." });
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setMessage({
        type: "error",
        text: "Password must contain uppercase, lowercase, number, special character and minimum 8 characters.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    const pendingSignup = {
      userData: {
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
      },
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    setIsSubmitting(true);

    try {
      await sendSignupOtp(pendingSignup.userData);

      localStorage.setItem("lostFoundPendingSignup", JSON.stringify(pendingSignup));

      setMessage({
        type: "success",
        text: "OTP sent successfully. Please verify your email.",
      });

      navigate("/verify-otp", { state: { email: cleanEmail } });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Signup OTP could not be sent.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup">
      <div className="signup__left">
        <div className="signup__overlay">
          <div className="signup__content">
            <h1>Lost & Found</h1>
            <p>
              Join our community and help reunite lost people and belongings
              safely.
            </p>
          </div>
        </div>
      </div>

      <div className="signup__right">
        <div className="signup__card">
          <h2>Create Account</h2>
          <p className="signup__subtitle">Sign up to continue</p>

          {message.text && (
            <div className={`signup__message signup__message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="signup__form" onSubmit={handleSubmit}>
            <div className="signup__field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={handleChange}
                pattern="[A-Za-z ]{3,}"
                title="Name should contain only alphabets and at least 3 letters"
                required
              />
            </div>

            <div className="signup__field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup__field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9+\-\s]{10,15}"
                title="Phone number should be 10 to 15 digits"
                required
              />
            </div>

            <div className="signup__field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup__field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button className="signup__btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Create Account"}
            </button>
          </form>

          <p className="signup__bottom">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
