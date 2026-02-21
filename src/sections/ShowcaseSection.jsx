import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TitleHeader from "../components/TitleHeader";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "SACS – South Asian Community Services",
    description:
      "A fully dynamic community platform built for a US-based NGO. Features a custom admin panel that allows the organization to update text, images, and content across every page — no developer needed. Built with a modern tech stack for speed and scalability.",
    tags: ["Next.js", "Supabase", "Dynamic CMS", "USA"],
    imgPath: "/images/eb475dda-800b-4356-9f1a-3a724f3687df.png",
    url: "https://www.sacgnh.org/",
    layout: "image-left",
  },
  {
    title: "SoulHome – Wellness & Membership Platform",
    description:
      "A premium wellness platform featuring a full members dashboard, an admin dashboard with Google Drive API integration for sharing resources, and Calendly-powered session booking. Admins can manage content, members, and resources — all from one place.",
    tags: ["Next.js", "Supabase", "Calendly", "Google Drive API", "Stripe"],
    imgPath: "/images/af6a448f-c99f-456a-9188-cb8b439a8999.png",
    url: "https://soulhome-website-1.vercel.app/",
    layout: "image-right",
  },
  {
    title: "PCPForAll – Healthcare Practice Website",
    description:
      "A professional healthcare website for a Houston-based doctor's practice. Features fully dynamic service pages that can be managed and updated through an admin panel — allowing the clinic to add, edit, or remove services without touching a single line of code.",
    tags: ["Next.js", "Dynamic Pages", "Healthcare", "Houston, TX"],
    imgPath: "/images/e4e0ef9a-00a2-4db2-86cb-0ce4576b2259.png",
    url: "https://www.pcpforall.com/",
    layout: "image-left",
  },
  {
    title: "XMF – Martial Arts Academy Platform",
    description:
      "A Bangalore-based martial arts academy website with a full student dashboard. Students can scan the QR code on their ID card to instantly access their dashboard and track stats — all updated by the admin. A seamless digital experience for both students and instructors.",
    tags: ["Next.js", "Student Dashboard", "QR Access", "Bangalore"],
    imgPath: "/images/fadd09ac-f971-4ec7-b58c-19a714b5abea.png",
    url: "https://xmf.co.in",
    layout: "image-right",
  },
  {
    title: "RemyaKrishnaKripa – Akashic Reading & Wellness",
    description:
      "A portfolio and booking platform for an India-based Akashic reading practitioner. Features Calendly integration for seamless session scheduling and WhatsApp integration for direct client communication — creating a smooth end-to-end booking experience.",
    tags: ["Next.js", "Calendly", "WhatsApp API", "India"],
    imgPath: "/images/43da7ceb-a6b2-4f2b-baa5-9e7c2ef9a470.png",
    url: "https://remyakrishnakripa.com",
    layout: "image-left",
  },
  {
    title: "TuberoExperts – Plumbing Services Website",
    description:
      "A professional plumbing services website built for a Philippines-based company. Optimized for SEO with strong search engine rankings, helping the business attract local customers organically through targeted keywords and fast load times.",
    tags: ["Next.js", "SEO Optimized", "Philippines"],
    imgPath: "/images/c34ed50e-53cf-4a58-971d-7d5a1754f8a5.png",
    url: "https://tuberoexperts.com/",
    layout: "image-right",
  },
  {
    title: "Caramellas – Cake Shop",
    description:
      "A delightful online presence for an Indian cake shop, showcasing their menu and specialties. Designed with a warm, inviting aesthetic that reflects the brand's personality and makes it easy for customers to browse and connect.",
    tags: ["Web Design", "E-commerce", "India"],
    imgPath: "/images/f2565d0e-79ec-437e-9601-bfecb1e13817.png",
    url: "https://caramellas.in/",
    layout: "image-left",
  },
  {
    title: "Pawar Travels – Cab Services Website",
    description:
      "A cab company website built for a Pune-based travel business. SEO-optimized to rank well on search engines, driving organic traffic and making it easy for customers to find and book rides online.",
    tags: ["Next.js", "SEO Optimized", "Pune, India"],
    imgPath: "/images/6361bb89-cb9b-4fb4-a1cd-bf1f4aae9e8c.png",
    url: "https://pawartravels.com/",
    layout: "image-right",
  },
  {
    title: "Acron Spring – Spring Manufacturing",
    description:
      "A professional website for a spring manufacturing company, showcasing their product range and capabilities. Built with a clean industrial design that communicates reliability and precision engineering.",
    tags: ["Web Design", "Manufacturing", "Industrial"],
    imgPath: "/images/665db6c3-0534-466c-be03-2b1ab45f0f1f.png",
    url: "https://acronspring.com/",
    layout: "image-left",
  },
];

const AppShowcase = () => {
  const sectionRef = useRef(null);
  const projectRefs = useRef([]);

  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.5 }
    );

    projectRefs.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
          },
        }
      );
    });
  }, []);

  return (
    <div id="work" ref={sectionRef} className="section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="My Work"
          sub="🚀 Real projects, real impact"
        />

        <div className="mt-16 flex flex-col gap-20">
          {projects.map((project, index) => {
            const isImageLeft = project.layout === "image-left";

            return (
              <div
                key={index}
                ref={(el) => (projectRefs.current[index] = el)}
                className={`flex flex-col ${isImageLeft ? "xl:flex-row" : "xl:flex-row-reverse"
                  } gap-10 items-center`}
              >
                {/* Image */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="xl:w-1/2 w-full rounded-2xl overflow-hidden border border-white/10 group cursor-pointer block"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={project.imgPath}
                      alt={project.title}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </a>

                {/* Text */}
                <div className="xl:w-1/2 w-full flex flex-col gap-5">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                    {project.title}
                  </h2>
                  <p className="text-white-50 text-base md:text-lg leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 bg-white/5 text-white-50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-fit inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold uppercase tracking-wider text-sm hover:bg-white/90 transition-colors duration-300"
                  >
                    Visit Site
                    <img src="/images/arrow-right.svg" alt="arrow" className="size-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppShowcase;
