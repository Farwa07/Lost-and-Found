import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS_KEY = "lostFoundUsers";
const REGISTERED_USER_KEY = "lostFoundRegisteredUser";
const CURRENT_USER_KEY = "lostFoundCurrentUser";
const AUTH_TOKEN_KEY = "lostFoundAuthToken";
const PROFILE_DATA_KEY = "lostFoundProfileData";

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const getUsers = () => {
  const users = safeParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(users) ? users : [];
};

const getRegisteredUser = () => {
  return safeParse(localStorage.getItem(REGISTERED_USER_KEY), null);
};

const findUserByEmail = (email) => {
  const cleanEmail = normalizeEmail(email);
  const users = getUsers();

  const userFromList = users.find(
    (user) => normalizeEmail(user.email) === cleanEmail
  );

  if (userFromList) {
    return userFromList;
  }

  const registeredUser = getRegisteredUser();

  if (
    registeredUser &&
    normalizeEmail(registeredUser.email) === cleanEmail
  ) {
    return registeredUser;
  }

  return null;
};

const updateUserPasswordEverywhere = (updatedUser) => {
  const users = getUsers();

  const existsInUsers = users.some(
    (user) => normalizeEmail(user.email) === normalizeEmail(updatedUser.email)
  );

  const nextUsers = existsInUsers
    ? users.map((user) =>
        normalizeEmail(user.email) === normalizeEmail(updatedUser.email)
          ? {
              ...user,
              password: updatedUser.password,
            }
          : user
      )
    : [updatedUser, ...users];

  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(updatedUser));

  localStorage.setItem(
    PROFILE_DATA_KEY,
    JSON.stringify({
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role || "Registered User",
    })
  );

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);

  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("profileUpdated"));
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [verifiedUser, setVerifiedUser] = useState(null);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const enteredEmail = normalizeEmail(email);

    if (!emailRegex.test(enteredEmail)) {
      alert("Enter valid email address");
      return;
    }

    const user = findUserByEmail(enteredEmail);

    if (!user) {
      alert("This email is not registered. Please enter your registered email.");
      return;
    }

    if (user.role === "Admin") {
      alert("Demo admin password cannot be reset from this screen.");
      return;
    }

    if (user.status === "Blocked") {
      alert("This account is blocked by admin.");
      return;
    }

    setVerifiedUser(user);

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

    updateUserPasswordEverywhere(updatedUser);

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
                Want to use another email?{" "}
                <span
                  onClick={() => {
                    setStep("email");
                    setPasswordData({
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setVerifiedUser(null);
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