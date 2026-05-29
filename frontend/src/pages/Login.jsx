import "./Login.css";

import { useState } from "react";

export default function Login() {

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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(formData.email)) {
      alert("Enter valid email");
      return;
    }

    console.log(formData);

    alert("Login Successful");

    setFormData({
      email: "",
      password: "",
    });
  };

  return (

    <div className="login">

      {/* LEFT SIDE */}

      <div className="login__left">

        <div className="login__overlay">

          <div className="login__content">

            <h1>
              Welcome Back
            </h1>

            <p>
              Sign in to continue helping reunite lost people and belongings.
            </p>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="login__right">

        <div className="login__card">

          <h2>
            Sign In
          </h2>

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

             {/* REMEMBER + FORGOT */}

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