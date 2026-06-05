import "./SignUp.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage({
      type: "",
      text: "",
    });
  };

  const getRegisteredUser = () => {
    try {
      const savedUser = localStorage.getItem("lostFoundRegisteredUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const generateOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    const cleanEmail = formData.email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid phone number.",
      });
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
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    const registeredUser = getRegisteredUser();

    if (
      registeredUser &&
      registeredUser.email?.toLowerCase() === cleanEmail
    ) {
      setMessage({
        type: "error",
        text: "This email is already registered. Please login instead.",
      });
      return;
    }

    const userData = {
      fullName: formData.fullName.trim(),
      email: cleanEmail,
      phone: formData.phone.trim(),
      password: formData.password,
    };

    const otp = generateOtp();

    const pendingSignup = {
      userData,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    localStorage.setItem(
      "lostFoundPendingSignup",
      JSON.stringify(pendingSignup)
    );

    console.log("Signup Data:", {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    });

    alert(`Demo OTP sent to your email: ${otp}`);

    setMessage({
      type: "success",
      text: "OTP sent successfully. Please verify your email.",
    });

    navigate("/verify-otp", {
      state: {
        email: userData.email,
      },
    });
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
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
                title="Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
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

            <button className="signup__btn" type="submit">
              Send OTP
            </button>
          </form>

          <p className="signup__bottom">
            Already have an account?
            <span onClick={() => navigate("/login")}> Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
}