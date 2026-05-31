import "./Terms.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { FaFileContract, FaCheckCircle, FaExclamationTriangle, FaUserShield } from "react-icons/fa";

export default function Terms() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="terms-page">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="terms-layout">
        <Sidebar open={sidebarOpen} />

        <main className="terms-main">
          <section className="terms-hero">
            <span className="terms-badge">
              <FaFileContract />
              Terms & Conditions
            </span>

            <h1>Terms For Using Lost & Found</h1>

            <p>
              By using this platform, users agree to follow the rules and use the
              system responsibly for reporting and searching lost or found cases.
            </p>
          </section>

          <section className="terms-content">
            <div className="terms-card">
              <FaCheckCircle />
              <h2>Acceptable Use</h2>
              <p>
                Users should submit only true and accurate reports. Fake,
                misleading, harmful, or inappropriate content is not allowed.
              </p>
            </div>

            <div className="terms-card">
              <FaUserShield />
              <h2>User Responsibility</h2>
              <p>
                Users are responsible for the information they provide in reports,
                comments, images, and contact forms.
              </p>
            </div>

            <div className="terms-card">
              <FaExclamationTriangle />
              <h2>Report Verification</h2>
              <p>
                Admin may verify, reject, update, or remove reports that appear
                fake, incomplete, duplicated, or inappropriate.
              </p>
            </div>

            <div className="terms-card">
              <FaFileContract />
              <h2>System Limitation</h2>
              <p>
                Lost & Found helps users share and search cases, but it is not a
                government or police tracking system and does not provide live GPS
                tracking.
              </p>
            </div>
          </section>

          <section className="terms-note">
            <h2>Agreement</h2>
            <p>
              By continuing to use Lost & Found, you agree to these terms and
              understand that the platform is designed to support community-based
              recovery of lost persons and items.
            </p>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}