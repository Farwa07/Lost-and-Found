import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");

  const [verifiedUser, setVerifiedUser] = useState(null);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const getRegisteredUser = () => {
    try {
      const savedUser = localStorage.getItem("lostFoundRegisteredUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const enteredEmail = email.trim().toLowerCase();

    if (!emailRegex.test(enteredEmail)) {
      alert("Enter valid email address");
      return;
    }

    const registeredUser = getRegisteredUser();

    if (!registeredUser) {
      alert("No account found. Please create an account first.");
      navigate("/signup");
      return;
    }

    if (registeredUser.email.toLowerCase() !== enteredEmail) {
      alert("This email is not registered. Please enter your registered email.");
      return;
    }

    setVerifiedUser(registeredUser);

    alert("Reset link verified. Now create your new password.");
    setStep("password");
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(passwordData.newPassword)) {
      alert(
        "Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!verifiedUser) {
      alert("Please verify your registered email first.");
      setStep("email");
      return;
    }

    const updatedUser = {
      ...verifiedUser,
      password: passwordData.newPassword,
    };

    const profileData = {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
    };

    localStorage.setItem(
      "lostFoundRegisteredUser",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      "lostFoundProfileData",
      JSON.stringify(profileData)
    );

    localStorage.removeItem("lostFoundAuthToken");
    localStorage.removeItem("lostFoundCurrentUser");

    window.dispatchEvent(new Event("authChanged"));

    alert("Password reset successfully. Please login with your new password.");

    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });

    setEmail("");
    setVerifiedUser(null);

    navigate("/login");
  };

  return (
    <div className="forgot">
      <div className="forgot__left">
        <div className="forgot__overlay">
          <div className="forgot__content">
            <h1>
              {step === "email" ? "Reset Password" : "Create New Password"}
            </h1>

            <p>
              {step === "email"
                ? "Enter your registered email and we will help you recover your account safely."
                : "Set a strong new password to secure your Lost & Found account."}
            </p>
          </div>
        </div>
      </div>

      <div className="forgot__right">
        <div className="forgot__card">
          {step === "email" ? (
            <>
              <h2>Forgot Password?</h2>

              <p className="forgot__subtitle">
                No worries, enter your registered email to reset your password
              </p>

              <form className="forgot__form" onSubmit={handleEmailSubmit}>
                <div className="forgot__field">
                  <label>Email Address</label>

                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button className="forgot__btn">
                  Send Reset Link
                </button>
              </form>

              <p className="forgot__bottom">
                Remember your password?{" "}
                <span onClick={() => navigate("/login")}>
                  Back to Login
                </span>
              </p>
            </>
          ) : (
            <>
              <h2>New Password</h2>

              <p className="forgot__subtitle">
                Enter and confirm your new password
              </p>

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

                <button className="forgot__btn">
                  Reset Password
                </button>
              </form>

              <p className="forgot__bottom">
                Want to change email?{" "}
                <span
                  onClick={() => {
                    setStep("email");
                    setVerifiedUser(null);
                    setPasswordData({
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Go Back
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}