import "./Contact.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { submitContactMessage } from "../api/contactApi";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

export default function Contact() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });

    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      newErrors.email = "Enter valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 15) {
      newErrors.message = "Message must be at least 15 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  if (!validateForm()) return;

  try {
    setIsSubmitting(true);
    setSuccess("");
    setErrors({});

    const response = await submitContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    setSuccess(response?.message || "Your message has been sent successfully!");

    if (!response?.duplicate) {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  } catch (error) {
    setErrors({
      submit: error.message || "Failed to send message. Please try again.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="contact-page">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="contact-layout">
        <Sidebar open={sidebarOpen} />

        <main className="contact-main">
          <section className="contact-hero">
            <span className="contact-badge">Contact Us</span>
            <h1>We Are Here To Help You</h1>
            <p>
              Have a question, report issue, or need help with a lost or found
              case? Send us a message and our team will guide you.
            </p>
          </section>

          <section className="contact-info-grid">
            <div className="contact-info-card">
              <FaEnvelope />
              <h3>Email</h3>
              <p>support@lostfound.com</p>
            </div>

            <div className="contact-info-card">
              <FaPhoneAlt />
              <h3>Phone</h3>
              <p>+92 300 1234567</p>
            </div>

            <div className="contact-info-card">
              <FaMapMarkerAlt />
              <h3>Location</h3>
              <p>Gujranwala, Pakistan</p>
            </div>

            <div className="contact-info-card">
              <FaClock />
              <h3>Working Hours</h3>
              <p>Mon - Sat, 9:00 AM - 6:00 PM</p>
            </div>
          </section>

          <section className="contact-section">
            <div className="contact-left">
              <h2>Get In Touch</h2>
              <p>
                <p>
  Fill out the form below and our team will review your message from the admin
  panel.
</p>
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-row">
                  <div className="contact-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <small>{errors.name}</small>}
                  </div>

                  <div className="contact-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <small>{errors.email}</small>}
                  </div>
                </div>

                <div className="contact-field">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && <small>{errors.subject}</small>}
                </div>

                <div className="contact-field">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && <small>{errors.message}</small>}
                </div>

                {success && <p className="contact-success">{success}</p>}
                {errors.submit && <small>{errors.submit}</small>}

                <button type="submit" className="contact-submit" disabled={isSubmitting}>
  <FaPaperPlane />
  {isSubmitting ? "Sending..." : "Send Message"}
</button>
              </form>
            </div>

            <div className="contact-right">
              <div className="contact-social-card">
                <h3>Follow Us</h3>
                <p>
                  Stay connected with Lost & Found for updates, alerts, and
                  community support.
                </p>

                <div className="contact-socials">
                  <a href="https://www.facebook.com" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="https://www.instagram.com" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="https://www.twitter.com" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}