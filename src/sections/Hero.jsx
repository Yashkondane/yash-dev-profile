import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import AnimatedCounter from "../components/AnimatedCounter";
import Button from "../components/Button";
import { words } from "../constants";
import OrreryExperience from "../components/OrreryExperience";

const Hero = () => {
  useGSAP(() => {
    gsap.fromTo(
      ".hero-text h1",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power2.inOut" }
    );
  });

  return (
    <section id="hero" className="relative overflow-hidden" style={{ minHeight: "100dvh" }}>
      {/* Background image - bottom layer */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg.png" alt="" className="w-full h-full object-cover opacity-30" />
      </div>

      {/* Orrery - Layer above background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
        }}
      >
        <OrreryExperience />
      </div>

      {/* Foreground content */}
      <div
        className="hero-layout"
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "40px" // Add space for navbar on mobile
        }}
      >
        {/* LEFT: Hero Content */}
        <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5 text-center md:text-left">
          <div className="flex flex-col gap-10 items-center md:items-start">
            <div className="hero-text">
              <h1 className="flex flex-col md:block">
                <span>Shaping</span>
                <span className="slide !inline-flex !h-auto !static md:!absolute md:!h-[78px] align-middle mt-2 md:mt-0">
                  <span className="wrapper !relative">
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className="flex items-center justify-center md:justify-start md:gap-3 gap-2 pb-2"
                      >
                        <img
                          src={word.imgPath}
                          alt="person"
                          className="xl:size-12 md:size-10 size-9 md:p-2 p-1.5 rounded-full bg-white-50"
                        />
                        <span className="text-white">{word.text}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </h1>
              <h1 className="md:mt-0 mt-4">into Real Projects</h1>
              <h1>that Deliver Results</h1>
            </div>

            <p className="text-white-50 md:text-xl text-lg max-w-lg relative z-10 pointer-events-none px-4 md:px-0 leading-relaxed opacity-80">
              Hi, I&apos;m Yash Kondane, a developer with a passion for code and building high-performance 3D experiences.
            </p>

            <Button
              text="See My Work"
              className="md:w-80 md:h-20 w-full max-w-[300px] h-14 text-lg"
              id="counter"
            />
          </div>
        </header>
      </div>


      <AnimatedCounter />
    </section>
  );
};

export default Hero;
