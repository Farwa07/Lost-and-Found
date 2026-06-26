import "./Login.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const cleanEmail = normalizeEmail(formData.email);

    if (!emailRegex.test(cleanEmail)) {
      setMessage({ type: "error", text: "Enter valid email." });
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResult = await login(cleanEmail, formData.password);

      if (!loginResult.success) {
        setMessage({ type: "error", text: loginResult.message || "Login failed." });
        return;
      }

      setMessage({ type: "success", text: "Login successful." });

      setFormData({ email: "", password: "", remember: false });

      if (loginResult.user?.role === "Admin") {
        navigate("/admin-panel");
        return;
      }

      navigate("/");
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Login failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      <div className="login__left">
        <div className="login__overlay">
          <div className="login__content">
            <h1>Welcome Back</h1>
            <p>Sign in to continue helping reunite lost people and belongings.</p>
          </div>
        </div>
      </div>

      <div className="login__right">
        <div className="login__card">
          <h2>Sign In</h2>
          <p className="login__subtitle">Login to your account</p>

          {message.text && (
            <div className={`login__message login__message--${message.type}`}>
              {message.text}
            </div>
          )}

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

  <div className="login__password-wrap">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Enter password"
      value={formData.password}
      onChange={handleChange}
      required
    />

    <button
      type="button"
      className="login__password-toggle"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>

            <div className="login__options">
              <label className="login__remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                />
                Remember me
              </label>

              <a href="/forgot-password" className="login__forgot">
                Forgot password?
              </a>
            </div>

            <button className="login__btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="login__subtitle" style={{ marginTop: "18px" }}>
            Demo Admin: admin@lostfound.com / Admin@123
          </p>

          <p className="login__bottom">
            Don&apos;t have an account? <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
}
