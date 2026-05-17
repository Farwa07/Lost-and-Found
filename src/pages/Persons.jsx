import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import "./Persons.css";

const personsData = [

  {
    id:1,
    status:"Missing",
    name:"Ali Hassan",
    age:12,
    location:"Lahore",
    image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:2,
    status:"Found",
    name:"Sara Khan",
    age:25,
    location:"Karachi",
    image:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:3,
    status:"Missing",
    name:"Ahmed Raza",
    age:31,
    location:"Islamabad",
    image:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:4,
    status:"Found",
    name:"Fatima Noor",
    age:18,
    location:"Multan",
    image:"https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:5,
    status:"Missing",
    name:"Usman Tariq",
    age:40,
    location:"Faisalabad",
    image:"https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:6,
    status:"Found",
    name:"Ayesha Malik",
    age:29,
    location:"Rawalpindi",
    image:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop"
  },

  {
  id:7,
  status:"Missing",
  name:"Hassan Ali",
  age:16,
  location:"Sialkot",
  image:"https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1200&auto=format&fit=crop"
},

{
  id:8,
  status:"Found",
  name:"Mariam Faisal",
  age:22,
  location:"Hyderabad",
  image:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop"
},

{
  id:9,
  status:"Missing",
  name:"Bilal Ahmed",
  age:35,
  location:"Peshawar",
  image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop"
}

];

export default function Persons(){

  const [sidebarOpen,setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return(

    <div className="persons-page">

      <Navbar
        toggleSidebar={()=>
          setSidebarOpen(prev => !prev)
        }
      />

      <div className="persons-container">

        <Sidebar open={sidebarOpen} />

        <main className="persons-main">

          {/* HEADER */}

          <div className="persons-header">

            <div>
              <h1>
                Missing & Found Persons
              </h1>

              <p>
                Search and explore reported person cases
              </p>
            </div>

            
          </div>

          {/* FILTERS */}

          <div className="persons-actions">

  <button className="missing-person-btn" onClick={() => navigate("/report-missing-person")}>
  Report Missing
</button>

<button className="found-person-btn" onClick={() => navigate("/report-found-person")}>
  Report Found
</button>

</div>

<div className="persons-filters">

  <input
    type="text"
    placeholder="Search by name..."
  />

  <select>
    <option>All Cases</option>
    <option>Missing</option>
    <option>Found</option>
  </select>

  <select>
    <option>All Cities</option>
    <option>Lahore</option>
    <option>Karachi</option>
    <option>Islamabad</option>
  </select>

  <select>
    <option>By Gender</option>
    <option>Male</option>
    <option>Female</option>
    <option>Other</option>
  </select>

</div>

          {/* PERSONS GRID */}

          <div className="persons-grid">

            {personsData.map((person)=>(

              <div
                key={person.id}
                className="person-card"
              >

                <div className={`person-status ${
                  person.status === "Found"
                    ? "status-found"
                    : "status-missing"
                }`}>

                  {person.status}

                </div>

                <img
                  src={person.image}
                  alt={person.name}
                />

                <div className="person-card-content">

                  <h3>
                    {person.name}
                  </h3>

                  <p>
                    Age: {person.age}
                  </p>

                  <p>
                    Location: {person.location}
                  </p>

                  <button>
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>
          <footer className="footer">

  <div className="footer__col">

    <h3>
      Lost & Found
    </h3>

    <p>
      Helping reunite people and belongings safely.
    </p>

  </div>

  <div className="footer__col">

    <h4>
      Quick Links
    </h4>

    <p>Home</p>
    <p>Persons</p>
    <p>Items</p>
    <p>Statistics</p>

  </div>

  <div className="footer__col">

    <h4>
      Support
    </h4>

    <p>FAQs</p>
    <p>Privacy Policy</p>
    <p>Terms & Conditions</p>

  </div>

  <div className="footer__col">

    <h4>
      Contact
    </h4>

    <p>support@lostfound.com</p>
    <p>+92 300 1234567</p>

  </div>

</footer>

        </main>

      </div>

    </div>
  );
}