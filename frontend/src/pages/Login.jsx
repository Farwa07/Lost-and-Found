import "./Login.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const getRegisteredUser = () => {
    try {
      const savedUser = localStorage.getItem("lostFoundRegisteredUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(formData.email)) {
      alert("Enter valid email");
      return;
    }

    const registeredUser = getRegisteredUser();

    if (!registeredUser) {
      alert("No account found. Please create an account first.");
      navigate("/signup");
      return;
    }

    if (registeredUser.email !== formData.email) {
      alert("This email is not registered. Please sign up first.");
      return;
    }

    if (!registeredUser.password) {
      alert("Your old signup data has no password saved. Please sign up again.");
      localStorage.removeItem("lostFoundRegisteredUser");
      localStorage.removeItem("lostFoundAuthToken");
      localStorage.removeItem("lostFoundCurrentUser");
      navigate("/signup");
      return;
    }

    if (registeredUser.password !== formData.password) {
      alert("Incorrect password. Please try again.");
      return;
    }

    login(registeredUser);

    console.log("Login Data:", {
      email: formData.email,
      remember: formData.remember,
    });

    alert("Login Successful");

    setFormData({
      email: "",
      password: "",
      remember: false,
    });

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

          <p className="login__subtitle">
            Login to your account
          </p>

          <form
            className="login__form"
            onSubmit={handleSubmit}
          >
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

            <button className="login__btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}