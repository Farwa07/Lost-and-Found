import "./Login.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const USERS_KEY = "lostFoundUsers";
const REGISTERED_USER_KEY = "lostFoundRegisteredUser";

const defaultAdminUser = {
  id: "admin-001",
  fullName: "System Admin",
  email: "admin@lostfound.com",
  phone: "03000000000",
  password: "Admin@123",
  role: "Admin",
  status: "Active",
  joinedAt: "2026-01-01",
};

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
  const savedUsers = safeParse(localStorage.getItem(USERS_KEY), []);
  const users = Array.isArray(savedUsers) ? savedUsers : [];

  const hasAdmin = users.some(
    (user) => normalizeEmail(user.email) === normalizeEmail(defaultAdminUser.email)
  );

  const finalUsers = hasAdmin ? users : [defaultAdminUser, ...users];

  localStorage.setItem(USERS_KEY, JSON.stringify(finalUsers));

  return finalUsers;
};

const getRegisteredUser = () => {
  return safeParse(localStorage.getItem(REGISTERED_USER_KEY), null);
};

const findLoginUser = (email) => {
  const users = getUsers();
  const cleanEmail = normalizeEmail(email);

  const userFromList = users.find(
    (user) => normalizeEmail(user.email) === cleanEmail
  );

  if (userFromList) {
    return userFromList;
  }

  const singleRegisteredUser = getRegisteredUser();

  if (
    singleRegisteredUser &&
    normalizeEmail(singleRegisteredUser.email) === cleanEmail
  ) {
    return {
      id:
        singleRegisteredUser.id ||
        `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fullName:
        singleRegisteredUser.fullName ||
        singleRegisteredUser.name ||
        "Registered User",
      email: normalizeEmail(singleRegisteredUser.email),
      phone: singleRegisteredUser.phone || "",
      password: singleRegisteredUser.password || "",
      role: singleRegisteredUser.role || "Registered User",
      status: singleRegisteredUser.status || "Active",
      joinedAt: singleRegisteredUser.joinedAt || new Date().toISOString().slice(0, 10),
    };
  }

  return null;
};

const saveUserBackToUsersList = (user) => {
  const users = getUsers();

  const exists = users.some(
    (item) => normalizeEmail(item.email) === normalizeEmail(user.email)
  );

  const nextUsers = exists
    ? users.map((item) =>
        normalizeEmail(item.email) === normalizeEmail(user.email)
          ? {
              ...item,
              ...user,
            }
          : item
      )
    : [user, ...users];

  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(user));
};

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const cleanEmail = normalizeEmail(formData.email);

    if (!emailRegex.test(cleanEmail)) {
      alert("Enter valid email");
      return;
    }

    const loginUser = findLoginUser(cleanEmail);

    if (!loginUser) {
      alert("This email is not registered. Please sign up first.");
      navigate("/signup");
      return;
    }

    if (loginUser.status === "Blocked") {
      alert("This account is blocked by admin.");
      return;
    }

    if (!loginUser.password) {
      alert("Your signup data has no password saved. Please sign up again.");
      localStorage.removeItem(REGISTERED_USER_KEY);
      localStorage.removeItem("lostFoundAuthToken");
      localStorage.removeItem("lostFoundCurrentUser");
      navigate("/signup");
      return;
    }

    if (loginUser.password !== formData.password) {
      alert("Incorrect password. Please try again.");
      return;
    }

    saveUserBackToUsersList(loginUser);

    const loginResult = login(loginUser);

    if (loginResult && loginResult.success === false) {
      alert(loginResult.message || "Login failed.");
      return;
    }

    console.log("Login Data:", {
      email: cleanEmail,
      remember: formData.remember,
      role: loginUser.role,
    });

    alert(
      loginUser.role === "Admin"
        ? "Admin Login Successful"
        : "Login Successful"
    );

    setFormData({
      email: "",
      password: "",
      remember: false,
    });

    if (loginUser.role === "Admin") {
  navigate("/admin-panel");
  return;
}

navigate("/");
  };

  return (
    <div className="login">
      <div className="login__left">
        <div className="login__overlay">
          <div className="login__content">
            <h1>Welcome Back</h1>

            <p>
              Sign in to continue helping reunite lost people and belongings.
            </p>
          </div>
        </div>
      </div>

      <div className="login__right">
        <div className="login__card">
          <h2>Sign In</h2>

          <p className="login__subtitle">Login to your account</p>

          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field">
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

            <div className="login__field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login__options">
              <label className="login__remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remember: e.target.checked,
                    })
                  }
                />

                Remember me
              </label>

              <a href="/forgot-password" className="login__forgot">
                Forgot password?
              </a>
            </div>

            <button className="login__btn">Sign In</button>
          </form>

          <p className="login__subtitle" style={{ marginTop: "18px" }}>
            Demo Admin: admin@lostfound.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}