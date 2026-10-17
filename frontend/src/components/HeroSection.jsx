import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import hero1 from "../assets/hero1.jpeg";
import hero2 from "../assets/hero5.jpg";
import hero3 from "../assets/hero3.webp";
import "./HeroSection.css";

const images = [hero1, hero2, hero3];
const SLIDE_MS = 6000;

export default function HeroSection() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [searchIn, setSearchIn] = useState("persons");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_MS);

    return () => clearInterval(slider);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const text = query.trim();
    navigate(`/${searchIn}${text ? `?q=${encodeURIComponent(text)}` : ""}`);
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* All slides stay mounted and cross-fade, so there is no flash while the next image loads. */}
      {images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt=""
          className={`hero__slide ${index === current ? "is-active" : ""}`}
          fetchPriority={index === 0 ? "high" : "low"}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      <div className="hero__overlay">
        <div className="hero__content">
          <h1 id="hero-title">Reuniting People & Items</h1>

          <p>
            Report missing persons and lost belongings, or help someone find theirs. Free and
            community driven across Pakistan.
          </p>

          <form className="hero__search" onSubmit={handleSearch} role="search">
            <label className="visually-hidden" htmlFor="hero-search-type">
              Search in
            </label>
            <select id="hero-search-type" value={searchIn} onChange={(e) => setSearchIn(e.target.value)}>
              <option value="persons">Persons</option>
              <option value="items">Items</option>
            </select>

            <label className="visually-hidden" htmlFor="hero-search-input">
              Search
            </label>
            <input
              id="hero-search-input"
              type="search"
              placeholder={searchIn === "persons" ? "Name, city or location..." : "Item, brand or city..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="submit" aria-label="Search">
              <FaSearch aria-hidden="true" />
              <span>Search</span>
            </button>
          </form>

          <div className="hero__buttons">
            <Link to="/report-missing-person" className="hero__btn hero__btn--dark">
              Report Missing Person
            </Link>
            <Link to="/report-lost-item" className="hero__btn hero__btn--light">
              Report Lost Item
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
