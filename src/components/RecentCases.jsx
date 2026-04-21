import CaseCard from "./CaseCard";
import "../styles/recentCases.css";

function RecentCases() {
  return (
    <section className="recent-cases">
      <h2>Recent Cases</h2>

      <div className="cases-grid">
        <CaseCard
          type="person"
          status="missing"
          image="/ali.jfif"
          name="Ali Khan"
          age="8"
        />

        <CaseCard
          type="item"
          status="found"
          image="/mobile.jpg"
          item="Mobile Phone"
          city="Lahore"
        />

        <CaseCard
          type="person"
          status="missing"
          image="/sara.jpg"
          name="Sara Ahmed"
          age="6"
        />

        <CaseCard
          type="item"
          status="found"
          image="/wallet.jfif"
          item="Wallet"
          city="Karachi"
        />

        <CaseCard
          type="person"
          status="missing"
          image="/umr.jpg"
          name="Umar Farooq"
          age="10"
        />

        <CaseCard
          type="item"
          status="found"
          image="/bag.jfif"
          item="Laptop Bag"
          city="Islamabad"
        />

        <CaseCard
          type="person"
          status="missing"
          image="/aysha.jfif"
          name="Ayesha Noor"
          age="6"
        />

        <CaseCard
          type="item"
          status="found"
          image="/keys.jfif"
          item="Car Keys"
          city="Multan"
        />

        <CaseCard
          type="person"
          status="missing"
          image="/hassan.jfif"
          name="Hassan Raza"
          age="9"
        />
      </div>
    </section>
  );
}

export default RecentCases;