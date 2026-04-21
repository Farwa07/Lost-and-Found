import { Link } from "react-router-dom"
import "../styles/navbar.css"
import Logo from "../assets/Logo.png"

function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <img src={Logo} alt="logo" className="logo" />
                <div className="nav-title">Lost & Found</div>
            </div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>

                <li className="dropdown">
                    <span>Lost &#x2304;</span>
                    <div className="dropdown-menu">
                    <Link to="/lost/person">Person</Link>
                    <Link to="/lost/item">Item</Link>
                    </div>
                </li>

                 <li className="dropdown">
                    <span>Found &#x2304;</span>
                    <div className="dropdown-menu">
                    <Link to="/found/person">Person</Link>
                    <Link to="/found/item">Item</Link>
                    </div>
                </li>

                <li><Link to="/search">Search</Link></li>
                <li><Link to="/statistics">Statistics</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
        </nav>
    )
}
export default Navbar