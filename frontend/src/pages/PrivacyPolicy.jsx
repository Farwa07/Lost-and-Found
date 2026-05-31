import "./PrivacyPolicy.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { FaShieldAlt, FaUserLock, FaDatabase, FaEnvelope } from "react-icons/fa";

export default function PrivacyPolicy() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="privacy-page">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="privacy-layout">
        <Sidebar open={sidebarOpen} />

        <main className="privacy-main">
          <section className="privacy-hero">
            <span className="privacy-badge">
              <FaShieldAlt />
              Privacy Policy
            </span>

            <h1>Your Privacy Matters To Us</h1>

            <p>
              This Privacy Policy explains how Lost & Found collects, uses, and
              protects user information while using our platform.
            </p>
          </section>

          <section className="privacy-content">
            <div className="privacy-card">
              <FaUserLock />
              <h2>Information We Collect</h2>
              <p>
                We may collect user details such as name, email, phone number,
                report information, location/city, uploaded images, and messages
                submitted through forms.
              </p>
            </div>

            <div className="privacy-card">
              <FaDatabase />
              <h2>How We Use Your Information</h2>
              <p>
                Your information is used to create reports, search lost or found
                cases, manage user accounts, send notifications, and improve the
                overall system experience.
              </p>
            </div>

            <div className="privacy-card">
              <FaShieldAlt />
              <h2>Data Protection</h2>
              <p>
                We try to keep user information secure by using authentication,
                protected access, and proper validation. Sensitive information
                should not be shared publicly in reports.
              </p>
            </div>

            <div className="privacy-card">
              <FaEnvelope />
              <h2>Contact Information</h2>
              <p>
                If you have questions about privacy or want to update your data,
                you can contact our support team through the Contact Us page.
              </p>
            </div>
          </section>

          <section className="privacy-note">
            <h2>Important Note</h2>
            <p>
              Lost & Found is an academic project. Backend security and real
              production privacy rules can be improved further during deployment.
            </p>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}