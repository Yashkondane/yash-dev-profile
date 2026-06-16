import { Suspense, lazy } from "react";
import Navbar from "./components/NavBar";
import Hero from "./sections/Hero";

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection"));
const LogoShowcase = lazy(() => import("./sections/LogoShowcase"));
const FeatureCards = lazy(() => import("./sections/FeatureCards"));
const TechStack = lazy(() => import("./sections/TechStack"));
const Testimonials = lazy(() => import("./sections/Testimonials"));
const Contact = lazy(() => import("./sections/Contact"));
const Footer = lazy(() => import("./sections/Footer"));

const App = () => (
  <>
    <Navbar />
    <Hero />
    <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
      <ShowcaseSection />
      <LogoShowcase />
      <FeatureCards />
      <TechStack />
      <Testimonials />
      <Contact />
      <Footer />
    </Suspense>
  </>
);

export default App;
