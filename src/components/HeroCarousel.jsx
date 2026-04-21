import { useEffect, useState } from "react";
import "../styles/hero.css";

const images = [
  "/hero6.jpeg",
  "/hero2.jpg",
  "/hero5.jpg",
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${images[current]})` }}
    >
      <div className="hero-overlay">
        <h1>Bringing the Lost Back Home</h1>
        <p>
          Helping people reconnect with their lost items and reunite
          with their loved ones through a trusted digital platform.
        </p>
        <p>
          Report lost or found cases easily and be part of a caring community.
        </p>
      </div>
    </section>
  );
};

export default HeroCarousel;