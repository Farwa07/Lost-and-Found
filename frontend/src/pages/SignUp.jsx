import "./SignUp.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import hero1 from "../assets/hero1.jpeg";

export default function SignUp() {
  const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  console.log(formData);
};

const navigate = useNavigate();

  return (

    <div className="signup">

      {/* LEFT SIDE */}

      <div className="signup__left">

        <div className="signup__overlay">

          <div className="signup__content">

            <h1>
              Lost & Found
            </h1>

            <p>
              Join our community and help reunite lost people and belongings safely.
            </p>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="signup__right">

        <div className="signup__card">

          <h2>
            Create Account
          </h2>

          <p className="signup__subtitle">
            Sign up to continue
          </p>

          <form className="signup__form" onSubmit={handleSubmit}>

            <div className="signup__field">
              <label>Full Name</label>
              <input
  type="text"
  name="fullName"
  placeholder="Enter your name"
  value={formData.fullName}
  onChange={handleChange}
  pattern="[A-Za-z\s]{3,}"
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

            <button className="signup__btn">
              Create Account
            </button>

          </form>

          <p className="signup__bottom">
  Already have an account?

  <span onClick={() => navigate("/login")}>
    Log In
  </span>
</p>

        </div>

      </div>

    </div>
  );
}