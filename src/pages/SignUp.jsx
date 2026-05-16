import "./SignUp.css";
import hero1 from "../assets/hero1.jpeg";

export default function SignUp() {

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

          <form className="signup__form">

            <div className="signup__field">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>

            <div className="signup__field">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="signup__field">
              <label>Password</label>
              <input type="password" placeholder="Enter password" />
            </div>

            <div className="signup__field">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm password" />
            </div>

            <button className="signup__btn">
              Create Account
            </button>

          </form>

          <p className="signup__bottom">
            Already have an account?
            <span> Sign In</span>
          </p>

        </div>

      </div>

    </div>
  );
}