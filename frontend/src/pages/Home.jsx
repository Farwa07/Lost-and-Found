import { useState } from "react";
import Footer from "../components/Footer";

import {
  FaTachometerAlt,
  FaSearch,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaCog,
  FaUserCircle,
  FaPlus,
  FaUser
} from "react-icons/fa";

import  bagimage from "../assets/bag.jfif";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";

import "./Home.css";

const recentReports = [

  {
    id:1,
    type:"Missing",
    category:"Person",
    title:"Missing Child Case",
    location:"Lahore, Pakistan",
    image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:2,
    type:"Found",
    category:"Item",
    title:"Found Backpack",
    location:"Islamabad, Pakistan",
    image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:3,
    type:"Missing",
    category:"Item",
    title:"Lost Mobile Phone",
    location:"Karachi, Pakistan",
    image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:4,
    type:"Found",
    category:"Person",
    title:"Found Elderly Person",
    location:"Rawalpindi, Pakistan",
    image:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:5,
    type:"Missing",
    category:"Person",
    title:"Missing Woman Report",
    location:"Faisalabad, Pakistan",
    image:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:6,
    type:"Found",
    category:"Item",
    title:"Found Wallet",
    location:"Multan, Pakistan",
    image:"https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:7,
    type:"Missing",
    category:"Item",
    title:"Lost Laptop Bag",
    location:"Sialkot, Pakistan",
    image:bagimage
  },

  {
    id:8,
    type:"Found",
    category:"Person",
    title:"Found Young Boy",
    location:"Peshawar, Pakistan",
    image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:9,
    type:"Missing",
    category:"Person",
    title:"Missing Student",
    location:"Gujranwala, Pakistan",
    image:"https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop"
  }

];

export default function Home(){

  const [sidebarOpen,setSidebarOpen] = useState(false);

  return(

    <div className="home">

      <Navbar
        toggleSidebar={()=>
          setSidebarOpen(prev => !prev)
        }
      />

      <div className="home__container">

        <Sidebar open={sidebarOpen} />

        <main className="home__main">

          <HeroSection />

          {/* FEATURE CARDS */}

          <section className="features">

            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers/>
              </div>

              <h3>
                Report Missing or Found Persons
              </h3>

              <p>
                Quickly report missing or found persons with detailed information.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaBoxOpen/>
              </div>

              <h3>
                Lost & Found Items
              </h3>

              <p>
                Post lost or found items to help reunite belongings.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaSearch/>
              </div>

              <h3>
                Advanced Search
              </h3>

              <p>
                Use powerful search tools to find cases quickly.
              </p>
            </div>

          </section>

          {/* REPORT SECTION */}

          <section className="report-section">

            <h2 className="section-title">
              Report a Case
            </h2>

            <p className="section-subtitle">
              Choose what you want to report
            </p>

            <div className="report-grid">

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  <FaUser/>
                </div>

                <h3>
                  Lost Person
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  <FaUser/>
                </div>

                <h3>
                  Found Person
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  <FaBoxOpen/>
                </div>

                <h3>
                  Lost Item
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  <FaBoxOpen/>
                </div>

                <h3>
                  Found Item
                </h3>

              </a>

            </div>

          </section>

          {/* RECENT REPORTS */}

          <section className="recent-reports">

            <h2 className="section-title">
              Recent Reports
            </h2>

            <div className="recent-grid">

              {recentReports.map((report)=>(
                <div key={report.id} className="recent-card">

  <div className={`case-tag ${
    report.type === "Found"
      ? "case-tag--found"
      : "case-tag--missing"
  }`}>

    {report.type}

  </div>

  <img
    src={report.image}
    alt="report"
  />

  <div className="recent-card__content">

    <span className="case-category">
      {report.category}
    </span>

    <h3>
      {report.title}
    </h3>

    <p>
      {report.location}
    </p>

    <button>
      View Details
    </button>

  </div>

</div>
              ))}

            </div>

          </section>

          {/* FOOTER */}

          <Footer />

              

        </main>

      </div>

    </div>
  );
}