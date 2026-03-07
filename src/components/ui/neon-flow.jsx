import React, { useEffect, useRef, useState } from 'react';
import { cn } from "../../lib/utils";

// Helper for random colors
const randomColors = (count) => {
    return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

export function TubesBackground({
    children,
    className,
    enableClickInteraction = true
}) {
    const canvasRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const tubesRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        let cleanup;

        const initTubes = async () => {
            if (!canvasRef.current) return;

            try {
                // We use the specific build from the CDN as it contains the exact effect requested
                // Using native dynamic import which works in modern browsers
                const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
                const TubesCursor = module.default;

                if (!mounted) return;

                const app = TubesCursor(canvasRef.current, {
                    tubes: {
                        colors: ["#f967fb", "#53bc28", "#6958d5"],
                        lights: {
                            intensity: 200,
                            colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
                        }
                    }
                });

                tubesRef.current = app;
                setIsLoaded(true);

                // Handle resize if the library doesn't automatically
                const handleResize = () => {
                    // The library handles its own resize internally
                };

                window.addEventListener('resize', handleResize);

                cleanup = () => {
                    window.removeEventListener('resize', handleResize);
                };

            } catch (error) {
                console.error("Failed to load TubesCursor:", error);
            }
        };

        initTubes();

        return () => {
            mounted = false;
            if (cleanup) cleanup();
        };
    }, []);

    // Listen for clicks on the window to randomly change tube and light colors
    useEffect(() => {
        if (!enableClickInteraction) return;

        const handleWindowClick = (e) => {
            // Don't change colors if clicking buttons, links, or inputs
            if (
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'A' ||
                e.target.closest('button') ||
                e.target.closest('a') ||
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'TEXTAREA'
            ) return;

            if (!tubesRef.current) return;

            const colors = randomColors(3);
            const lightsColors = randomColors(4);

            tubesRef.current.tubes.setColors(colors);
            tubesRef.current.tubes.setLightsColors(lightsColors);
        };

        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, [enableClickInteraction]);

    return (
        <div className={cn("relative w-full h-full", className)}>
            {/* 
        This is the global backdrop canvas. 
        fixed inset-0 makes it cover the viewport entirely, 
        z-[-1] puts it behind all content, 
        pointer-events-none lets clicks pass through so links/buttons still work. 
      */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full block z-[-1] pointer-events-none"
                style={{ touchAction: 'none' }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}

export default TubesBackground;
