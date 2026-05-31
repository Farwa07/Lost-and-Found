import "./Faqs.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function Faqs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Can I search reports without creating an account?",
      answer:
        "Yes, unregistered users can search and view lost or found persons and items reports.",
    },
    {
      question: "Do I need an account to create a report?",
      answer:
        "Yes, you need to sign up or login before creating a lost or found report.",
    },
    {
      question: "Can I report both persons and items?",
      answer:
        "Yes, this system supports lost and found reports for both persons and items.",
    },
    {
      question: "How can I update my submitted report?",
      answer:
        "You can update your own reports from the My Reports section after login.",
    },
    {
      question: "Can I delete my own report?",
      answer:
        "Yes, registered users can delete only their own submitted reports.",
    },
    {
      question: "How will I know if a match is found?",
      answer:
        "The system can notify users through notifications or email alerts when a possible match is found.",
    },
    {
      question: "Can fake or inappropriate reports be removed?",
      answer:
        "Yes, admin can verify reports and remove fake or inappropriate content.",
    },
    {
      question: "Can I contact the person who posted a report?",
      answer:
        "You can use the available contact details or comment feature if provided in the report.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faqs-page">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="faqs-layout">
        <Sidebar open={sidebarOpen} />

        <main className="faqs-main">
          <section className="faqs-hero">
            <span className="faqs-badge">
              <FaQuestionCircle />
              FAQs
            </span>

            <h1>Frequently Asked Questions</h1>

            <p>
              Find quick answers about reporting, searching, verification,
              notifications, and using the Lost & Found platform.
            </p>
          </section>

          <section className="faqs-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search your question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          <section className="faqs-content">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  className={`faq-card ${
                    activeIndex === index ? "faq-card--active" : ""
                  }`}
                  key={index}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  {activeIndex === index && (
                    <p className="faq-answer">{faq.answer}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="faqs-empty">
                <h3>No question found</h3>
                <p>Try searching with another keyword.</p>
              </div>
            )}
          </section>

          <section className="faqs-contact-box">
            <h2>Still Need Help?</h2>
            <p>
              If you did not find your answer, you can contact our support team.
            </p>
            <a href="/contact">Contact Us</a>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}