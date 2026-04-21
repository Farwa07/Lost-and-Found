import RecentCases from "../components/RecentCases";
import "../styles/Home.css";
import HeroCarousel from "../components/HeroCarousel";

const Home = () => {
    return (
        <>
          <HeroCarousel />
          <RecentCases />
        </>
    );
};

export default Home;