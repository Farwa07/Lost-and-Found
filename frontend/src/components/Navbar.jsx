import "./Navbar.css";
import { FaUser } from "react-icons/fa";
import logo from "../assets/Logo.png";
import { Link } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {

  return (
    <header className="navbar">

      <button className="navbar__menu" onClick={toggleSidebar}>
        ☰
      </button>

      <Link to="/" className="navbar__brand">
  <div className="navbar__logo">
    <img src={logo} alt="logo" />
  </div>

  <h2>Lost & Found</h2>
</Link>

      <nav className="navbar__links">
        <a href="/">Home</a>
        <a href="/persons">Persons</a>
        <a href="/items">Items</a>
        <a href="/statistics">Statistics</a>
        <a href="/contact">Contact</a>
      </nav>

      <div className="navbar__right">
        <a href="/signup">
          <button className="navbar__signup">
            <FaUser/>
            Sign Up
           </button>
        </a>
      </div>
      
    </header>
  );
}