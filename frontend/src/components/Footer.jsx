import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <h3>Lost & Found</h3>
        <p>Helping reunite people and belongings safely.</p>
      </div>

      <div>
        <h4>Quick Links</h4>
        <a href="/">Home</a>
        <a href="/persons">Persons</a>
        <a href="/items">Items</a>
        <a href="/statistics">Statistics</a>
      </div>

      <div>
        <h4>Support</h4>
        <a href="/faqs">FAQs</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms & Conditions</a>
      </div>

      <div>
        <h4>Contact</h4>
        <p>support@lostandfound.com</p>
        <p>+92 300 1234567</p>
      </div>
    </footer>
  );
}