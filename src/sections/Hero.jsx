import React from 'react';
import { TubesBackground } from "../components/ui/neon-flow";
import Button from "../components/Button";

const Hero = () => {
  return (
    <section id="hero" className="relative font-sans" style={{ minHeight: "100dvh" }}>
      <TubesBackground>
        <div className="flex flex-col items-center justify-center w-full min-h-[100dvh] gap-8 text-center px-4 relative z-10">
          <div className="space-y-6 pointer-events-auto cursor-default mt-20 md:mt-0 max-w-4xl relative z-20">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 drop-shadow-lg">
              Architecting <br className="hidden md:block" /> the Future
            </h1>
            <p className="text-white-50 md:text-xl relative z-10 md:max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
              We create scalable solutions, high-performance web applications, and dynamic 3D experiences that deliver real results.
            </p>
          </div>

          <div className="mt-12 relative z-20 pointer-events-auto flex justify-center">
            <Button
              text="See Our Past Work"
              className="w-auto"
              id="work"
            />
          </div>

          <div className="absolute bottom-12 flex flex-col items-center gap-2 text-white/50 animate-pulse pointer-events-none">
            <span className="text-xs md:text-sm uppercase tracking-widest text-center px-4">
              Move the cursor around to interact and Click to randomize.
            </span>
          </div>
        </div>
      </TubesBackground>
    </section>
  );
};

export default Hero;
