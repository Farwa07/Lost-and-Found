import { useEffect, useState } from "react";
import hero1 from "../assets/hero1.jpeg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import "./HeroSection.css";

const images = [
  hero1,
  hero2,
  hero3
];


export default function HeroSection(){

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

            <button className="hero__primary">
              Search Cases
            </button>

            <button className="hero__secondary">
              Report a Case
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}