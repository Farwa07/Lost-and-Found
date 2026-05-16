import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";

import "./Home.css";

const recentReports = [
  1,2,3,4,5,6,7,8,9
];

export default function Home(){

  const [sidebarOpen,setSidebarOpen] = useState(true);

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
                👤
              </div>

              <h3>
                Report Missing Persons
              </h3>

              <p>
                Quickly report missing persons with detailed information.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                🎒
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
                🔍
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
                  👤
                </div>

                <h3>
                  Lost Person
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  👤
                </div>

                <h3>
                  Found Person
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  🎒
                </div>

                <h3>
                  Lost Item
                </h3>

              </a>

              <a href="#" className="report-card">

                <div className="report-card__icon">
                  🎒
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

              {recentReports.map((item)=>(
                <div key={item} className="recent-card">

                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
                    alt="report"
                  />

                  <div className="recent-card__content">

                    <h3>
                      Missing Person Case
                    </h3>

                    <p>
                      Lahore, Pakistan
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