import { useEffect, useState } from "react";
import hero1 from "../assets/hero1.jpeg";
import hero2 from "../assets/hero5.jpg";
import hero3 from "../assets/hero3.webp";
import "./HeroSection.css";
import { useNavigate } from "react-router-dom";

const images = [
  hero1,
  hero2,
  hero3
];


export default function HeroSection(){
  const navigate = useNavigate();

  const [current,setCurrent] = useState(0);

  useEffect(()=>{

    const slider = setInterval(()=>{

      setCurrent((prev)=>
        (prev + 1) % images.length
      );

    },4000);

    return ()=> clearInterval(slider);

  },[]);

  return(

    <section
      className="hero"
      style={{
        backgroundImage:`url(${images[current]})`
      }}
    >

      <div className="hero__overlay">

        <div className="hero__content">

          <h1>
            Reuniting People & Items
          </h1>

          <p>
            A comprehensive platform to report and find lost persons and items.
          </p>

       <div className="hero__buttons">
  <button onClick={() => navigate("/persons")}>
    Search Persons
  </button>

  <button onClick={() => navigate("/items")}>
    Search Items
  </button>

  <button onClick={() => navigate("/report-missing-person")}>
    Report Missing Person
  </button>

  <button onClick={() => navigate("/report-lost-item")}>
    Report Lost Item
  </button>
</div>

        </div>

      </div>

    </section>
  );
}