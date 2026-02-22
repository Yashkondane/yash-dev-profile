import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Wireframe } from "three/addons/lines/Wireframe.js";
import { WireframeGeometry2 } from "three/addons/lines/WireframeGeometry2.js";

const WireframeExperience = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 400;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0.0);
        container.appendChild(renderer.domElement);

        // Scene & Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
        camera.position.set(-50, 0, 50);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 500;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Fat wireframe
        const geo = new THREE.IcosahedronGeometry(20, 1);
        const wireGeo = new WireframeGeometry2(geo);
        const matLine = new LineMaterial({
            color: 0x4080ff,
            linewidth: 3,
            dashed: false,
        });
        matLine.resolution.set(width, height);

        const wireframe = new Wireframe(wireGeo, matLine);
        wireframe.computeLineDistances();
        scene.add(wireframe);

        // Gentle auto-rotate
        let animId;
        let isVisible = true;

        function animate() {
            animId = requestAnimationFrame(animate);
            if (!isVisible) return;
            wireframe.rotation.y += 0.003;
            wireframe.rotation.x += 0.001;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Pause when off-screen
        const observer = new IntersectionObserver(
            (entries) => { isVisible = entries[0].isIntersecting; },
            { threshold: 0.05 }
        );
        observer.observe(container);

        // Resize
        const resizeObserver = new ResizeObserver(() => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            matLine.resolution.set(w, h);
        });
        resizeObserver.observe(container);

        // Cleanup
        return () => {
            cancelAnimationFrame(animId);
            observer.disconnect();
            resizeObserver.disconnect();
            controls.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", minHeight: "380px" }}
        />
    );
};

export default WireframeExperience;
