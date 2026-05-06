import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend API later
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "500", marginBottom: "6px" }}>
          Contact Us
        </h1>
        <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6" }}>
          Have a question or found something? Reach out to us — we're here to help.
        </p>
      </div>

      {/* Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "2rem" }}>
        {[
          { icon: "✉️", label: "Email", value: "lostandfound@gmail.com" },
          { icon: "📞", label: "Phone", value: "+92 300 1234567" },
          { icon: "📍", label: "Location", value: "Gujranwala, Punjab" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#f5f5f5", borderRadius: "8px", padding: "1rem" }}>
            <div style={{ fontSize: "20px" }}>{item.icon}</div>
            <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginTop: "6px" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "500", marginTop: "4px" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {submitted ? (
        <div style={{ padding: "2rem", textAlign: "center", background: "#e6f9f0", borderRadius: "12px" }}>
          <p style={{ fontSize: "18px", color: "#0F6E56", fontWeight: "500" }}>
            ✅ Message sent! We'll get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>Your name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ali Hassan" required
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>Email address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>Subject</label>
            <select name="subject" value={formData.subject} onChange={handleChange}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}>
              <option>General inquiry</option>
              <option>Report an issue</option>
              <option>Found item info</option>
              <option>Missing person tip</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>Message</label>
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write your message here..." required rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <button type="submit"
            style={{ width: "100%", padding: "10px", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: "pointer" }}>
            Send message →
          </button>
        </form>
      )}
    </div>
  );
}