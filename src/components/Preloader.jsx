import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Enforce a minimum load time of 2.5s for the aesthetic effect
        const minLoadTime = 2500;
        let isLoaded = false;
        let minTimeElapsed = false;

        const timer = setTimeout(() => {
            minTimeElapsed = true;
            if (isLoaded) setLoading(false);
        }, minLoadTime);

        const handleLoad = () => {
            isLoaded = true;
            if (minTimeElapsed) setLoading(false);
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad, false);
        }

        // Safety fallback: enforce removal after 5 seconds just in case
        const fallbackTimer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            window.removeEventListener("load", handleLoad);
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
                >
                    {/* Subtle glowing background grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(100,200,255,0.1) 0%, transparent 70%)' }} />

                    {/* Logo & Text Wrapper */}
                    <div className="relative z-10 flex flex-col items-center gap-10 w-full px-4 text-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-center"
                        >
                            {/* Use screen blend mode and brightness to strip the gray box but keep the logo's color */}
                            <img
                                src="/images/8f086b67-bcdb-4444-b928-e470084b7b47.png"
                                alt="Hyperlink Tech Solutions"
                                className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_0_20px_rgba(100,200,255,0.3)] animate-pulse"
                                style={{ mixBlendMode: 'screen', filter: 'contrast(1.2) brightness(1.2)' }}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col gap-2"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-[0.2em] uppercase drop-shadow-md">
                                Let's Build Your <br className="md:hidden" /> Tech With Us
                            </h2>
                            <div className="flex gap-1 justify-center mt-2 opacity-50">
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-white rounded-full" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
