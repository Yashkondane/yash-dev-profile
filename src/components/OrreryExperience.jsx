import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ── Shaders ──
const starVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
    vPosition=position;
    vNormal=normal;
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const starFragmentShader = `
uniform float time;
uniform float intensity;
uniform vec3 color1;
uniform vec3 color2;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
float noise(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,54.53)))*43758.5453);}
void main(){
    vec3 pos=vPosition+time*0.1;
    float n1=noise(pos*3.0);
    float n2=noise(pos*6.0+vec3(100.0));
    float n3=noise(pos*12.0+vec3(200.0));
    float pattern=n1*0.5+n2*0.3+n3*0.2;
    pattern=pow(pattern,2.0);
    vec3 finalColor=mix(color1,color2,pattern);
    finalColor*=(1.0+intensity*pattern*2.0);
    float fresnel=pow(1.0-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);
    finalColor+=fresnel*intensity*0.5;
    gl_FragColor=vec4(finalColor,1.0);
}`;

const planetVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
    vPosition=position;
    vNormal=normalize(normalMatrix*normal);
    vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const planetFragmentShader = `
uniform float time;
uniform vec3 baseColor;
uniform vec3 accentColor;
uniform float energy;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
    vec2 uv=vUv+time*0.02;
    float n1=noise(uv*8.0);
    float n2=noise(uv*16.0);
    float pattern=n1*0.7+n2*0.3;
    vec3 color=mix(baseColor,accentColor,pattern);
    float fresnel=pow(1.0-abs(dot(vNormal,vec3(0.0,0.0,1.0))),1.5);
    color+=fresnel*accentColor*0.5;
    color*=(1.0+energy*0.8);
    gl_FragColor=vec4(color,1.0);
}`;

const arcVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main(){
    vUv=uv;
    vPosition=position;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const arcFragmentShader = `
uniform float time;
uniform vec3 color;
uniform float opacity;
uniform float energy;
varying vec2 vUv;
varying vec3 vPosition;
void main(){
    float flow=abs(sin(vUv.x*15.0-time*12.0));
    float pulse=sin(time*8.0)*0.5+0.5;
    float pattern=pow(flow,1.5)*(1.0+pulse*energy);
    float fade=sin(vUv.x*3.14159);
    vec3 finalColor=color*(pattern*2.0+0.3);
    float alpha=fade*opacity*(pattern+0.2)*(1.0+energy);
    gl_FragColor=vec4(finalColor,alpha);
}`;

// ── Themes ──
const themes = [
    {
        name: "Inferno",
        starColors: { color1: 0xffffff, color2: 0xffcc00 },
        planetData: [
            { baseColor: [0.8, 0.2, 0.1], accentColor: [1, 0.6, 0.2], trailColor: 0xff4400 },
            { baseColor: [0.6, 0.1, 0.1], accentColor: [1, 0.4, 0.1], trailColor: 0xff8800 },
            { baseColor: [0.9, 0.3, 0], accentColor: [1, 0.8, 0.3], trailColor: 0xffaa33 },
        ],
        ambientLightColor: 0x401008, starLightColor: 0xffcc88,
        directionalLights: { color1: 0xff6600, color2: 0xdd3300 },
        metalMaterialColor: 0x332222, ringColor: 0xff8866, arcColor: 0xffccaa,
    },
    {
        name: "Veridian",
        starColors: { color1: 0xccffee, color2: 0x66ffcc },
        planetData: [
            { baseColor: [0.2, 0.8, 0.5], accentColor: [0.8, 1, 0.9], trailColor: 0x00ffaa },
            { baseColor: [0.1, 0.6, 0.7], accentColor: [0.5, 0.9, 1], trailColor: 0x00ccff },
            { baseColor: [0.5, 0.8, 0.2], accentColor: [0.9, 1, 0.6], trailColor: 0xaaff00 },
        ],
        ambientLightColor: 0x0a3024, starLightColor: 0xccffdd,
        directionalLights: { color1: 0x33cc88, color2: 0x4488cc },
        metalMaterialColor: 0x779988, ringColor: 0x88ffcc, arcColor: 0xeeffee,
    },
    {
        name: "Celestial",
        starColors: { color1: 0xffe4b5, color2: 0xff8844 },
        planetData: [
            { baseColor: [1, 0.4, 0.4], accentColor: [1, 0.8, 0.2], trailColor: 0xff6644 },
            { baseColor: [0.3, 0.8, 0.3], accentColor: [0.6, 1, 0.8], trailColor: 0x44ff88 },
            { baseColor: [0.3, 0.4, 1], accentColor: [0.8, 0.6, 1], trailColor: 0x4488ff },
        ],
        ambientLightColor: 0x1a2440, starLightColor: 0xffe4b5,
        directionalLights: { color1: 0x4488ff, color2: 0x8844ff },
        metalMaterialColor: 0x4a6080, ringColor: 0x88ccff, arcColor: 0xffeebb,
    },
];

const OrreryExperience = () => {
    const containerRef = useRef(null);
    const sceneDataRef = useRef(null);
    const animFrameRef = useRef(null);

    // ── Initialize Three.js ──
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        console.log("Orrery: Initializing...", container.clientWidth, container.clientHeight);

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 600;

        const clock = new THREE.Clock();
        let currentThemeIndex = 0;
        let timeAcceleration = 1.0;
        let isResonanceActive = false;
        const planets = [];
        const activeEffects = [];
        const particleSystems = [];

        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 3000);
        camera.position.set(25, 20, 25);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.03;
        controls.minDistance = 8;
        controls.maxDistance = 150;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
        controls.enablePan = false;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x1a2440, 0.8);
        scene.add(ambientLight);

        const starLight = new THREE.PointLight(0xffe4b5, 3, 120, 1.8);
        starLight.castShadow = true;
        starLight.shadow.mapSize.width = 1024;
        starLight.shadow.mapSize.height = 1024;
        scene.add(starLight);

        const blueLight = new THREE.DirectionalLight(0x4488ff, 0.5);
        blueLight.position.set(-50, 30, -30);
        scene.add(blueLight);

        const purpleLight = new THREE.DirectionalLight(0x8844ff, 0.3);
        purpleLight.position.set(30, -20, 50);
        scene.add(purpleLight);

        // Post-processing
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.6, 0.5, 0.15
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // Orrery
        const orrery = new THREE.Group();
        scene.add(orrery);

        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a6080, metalness: 0.95, roughness: 0.2,
            emissive: 0x1a2540, emissiveIntensity: 0.4, envMapIntensity: 1.5,
        });
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff, wireframe: true, transparent: true, opacity: 0.4,
        });

        // Star
        const starGeo = new THREE.IcosahedronGeometry(2.2, 2);
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }, intensity: { value: 1 },
                color1: { value: new THREE.Color(themes[0].starColors.color1) },
                color2: { value: new THREE.Color(themes[0].starColors.color2) },
            },
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
        });
        const star = new THREE.Mesh(starGeo, starMaterial);
        orrery.add(star);

        // Gears
        for (let i = 0; i < 7; i++) {
            const gearGeo = new THREE.TorusGeometry(2.8 + i * 0.5, 0.18, 12, 64);
            const gear = new THREE.Mesh(gearGeo, metalMaterial);
            gear.rotation.x = Math.PI / 2;
            gear.position.y = -2 - i * 0.25;
            gear.userData.rotationSpeed = (i % 2 === 0 ? 1 : -1) * (0.08 + i * 0.04);
            gear.castShadow = true;
            gear.receiveShadow = true;
            orrery.add(gear);
        }

        // Planets
        const planetGeometries = [
            new THREE.OctahedronGeometry(0.6, 1),
            new THREE.DodecahedronGeometry(0.9, 1),
            new THREE.IcosahedronGeometry(0.7, 1),
        ];
        const planetBaseData = [
            { size: 0.6, distance: 8, speed: 0.6 },
            { size: 0.9, distance: 14, speed: 0.35 },
            { size: 0.7, distance: 22, speed: 0.25 },
        ];

        planetBaseData.forEach((data, i) => {
            const planetGroup = new THREE.Group();
            planetGroup.userData.orbitSpeed = data.speed;
            planetGroup.rotation.y = Math.random() * Math.PI * 2;
            orrery.add(planetGroup);

            const ringGeo = new THREE.TorusGeometry(data.distance, 0.08, 20, 128);
            const ring = new THREE.Mesh(ringGeo, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planetGroup.add(ring);

            const planetMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: new THREE.Vector3(...themes[0].planetData[i].baseColor) },
                    accentColor: { value: new THREE.Vector3(...themes[0].planetData[i].accentColor) },
                    energy: { value: 0 },
                },
                vertexShader: planetVertexShader,
                fragmentShader: planetFragmentShader,
            });

            const planet = new THREE.Mesh(planetGeometries[i], planetMaterial);
            planet.position.x = data.distance;
            planet.userData.selfRotation = 0.6;
            planet.castShadow = true;
            planet.receiveShadow = true;
            planetGroup.add(planet);

            // Particle trail
            const count = 50;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const c = new THREE.Color(themes[0].planetData[i].trailColor);
            for (let j = 0; j < count; j++) {
                const angle = (j / count) * Math.PI * 2;
                positions[j * 3] = Math.cos(angle) * data.distance;
                positions[j * 3 + 1] = 0;
                positions[j * 3 + 2] = Math.sin(angle) * data.distance;
                colors[j * 3] = c.r; colors[j * 3 + 1] = c.g; colors[j * 3 + 2] = c.b;
                sizes[j] = Math.random() * 0.5 + 0.1;
            }
            const geom = new THREE.BufferGeometry();
            geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
            const mat = new THREE.PointsMaterial({
                size: 0.3, vertexColors: true, transparent: true, opacity: 0.6,
                blending: THREE.AdditiveBlending, sizeAttenuation: true,
            });
            const points = new THREE.Points(geom, mat);
            planetGroup.add(points);

            particleSystems.push({ system: points, positions, radius: data.distance });
            planets.push({ group: planetGroup, body: planet, material: planetMaterial });
        });

        // Stars environment
        const layers = [
            { count: 3000, distance: [600, 1000], size: [0.8, 1.5], color: 0x6688bb },
            { count: 2000, distance: [1000, 1500], size: [1, 2], color: 0x88aadd },
            { count: 1000, distance: [1500, 2000], size: [1.5, 3], color: 0xaaccff },
        ];
        layers.forEach((layer) => {
            const positions = new Float32Array(layer.count * 3);
            const clrs = new Float32Array(layer.count * 3);
            const c = new THREE.Color(layer.color);
            for (let i = 0; i < layer.count; i++) {
                const u = Math.random(), v = Math.random();
                const theta = 2 * Math.PI * u;
                const phi = Math.acos(2 * v - 1);
                const r = layer.distance[0] + Math.random() * (layer.distance[1] - layer.distance[0]);
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);
                clrs[i * 3] = c.r; clrs[i * 3 + 1] = c.g; clrs[i * 3 + 2] = c.b;
            }
            const geom = new THREE.BufferGeometry();
            geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geom.setAttribute("color", new THREE.BufferAttribute(clrs, 3));
            const mat = new THREE.PointsMaterial({
                size: 2, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.8,
            });
            scene.add(new THREE.Points(geom, mat));
        });

        // Apply theme function
        function applyTheme(idx) {
            const theme = themes[idx];
            star.material.uniforms.color1.value.set(theme.starColors.color1);
            star.material.uniforms.color2.value.set(theme.starColors.color2);
            planets.forEach((p, j) => {
                const pd = theme.planetData[j];
                p.material.uniforms.baseColor.value.set(...pd.baseColor);
                p.material.uniforms.accentColor.value.set(...pd.accentColor);
            });
            particleSystems.forEach((ps, j) => {
                const nc = new THREE.Color(theme.planetData[j].trailColor);
                const col = ps.system.geometry.attributes.color;
                for (let k = 0; k < col.count; k++) col.setXYZ(k, nc.r, nc.g, nc.b);
                col.needsUpdate = true;
            });
            ambientLight.color.set(theme.ambientLightColor);
            starLight.color.set(theme.starLightColor);
            blueLight.color.set(theme.directionalLights.color1);
            purpleLight.color.set(theme.directionalLights.color2);
            metalMaterial.color.set(theme.metalMaterialColor);
            ringMaterial.color.set(theme.ringColor);
        }

        // Hardcode Celestial theme (index 2)
        applyTheme(2);

        // Create arc
        function createEnhancedArc(obj1, obj2, duration) {
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(themes[currentThemeIndex].arcColor) },
                    opacity: { value: 0 }, energy: { value: 0 },
                },
                vertexShader: arcVertexShader,
                fragmentShader: arcFragmentShader,
                transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
            });
            const arcEffect = {
                type: "arc", mesh: null, material, startTime: clock.getElapsedTime(),
                duration, obj1, obj2,
                update(elapsed) {
                    const prog = elapsed / duration;
                    if (prog > 1) return;
                    const p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
                    obj1.getWorldPosition(p1);
                    obj2.getWorldPosition(p2);
                    const mid = p1.clone().lerp(p2, 0.5);
                    const ctrl = mid.clone().add(new THREE.Vector3(0, p1.distanceTo(p2) * 0.5, 0));
                    const curve = new THREE.QuadraticBezierCurve3(p1, ctrl, p2);
                    const tube = new THREE.TubeGeometry(curve, 48, 0.15, 12, false);
                    if (!this.mesh) {
                        this.mesh = new THREE.Mesh(tube, material);
                        scene.add(this.mesh);
                    } else {
                        this.mesh.geometry.dispose();
                        this.mesh.geometry = tube;
                    }
                    const intens = Math.sin(prog * Math.PI);
                    material.uniforms.opacity.value = intens * 0.9;
                    material.uniforms.energy.value = intens * 2;
                    material.uniforms.time.value = clock.getElapsedTime();
                    this.mesh.visible = true;
                },
                end() {
                    if (this.mesh) {
                        scene.remove(this.mesh);
                        this.mesh.geometry.dispose();
                        this.material.dispose();
                    }
                },
            };
            activeEffects.push(arcEffect);
        }

        // Store data for button handlers
        sceneDataRef.current = {
            camera, controls, clock, planets, star, starLight, metalMaterial,
            activeEffects, scene, currentThemeIndex, timeAcceleration, isResonanceActive,
            applyTheme, createEnhancedArc,
            setThemeIndex(idx) { currentThemeIndex = idx; sceneDataRef.current.currentThemeIndex = idx; },
            setTimeAcceleration(v) { timeAcceleration = v; sceneDataRef.current.timeAcceleration = v; },
            setResonanceActive(v) { isResonanceActive = v; sceneDataRef.current.isResonanceActive = v; },
        };

        // Resize handler
        const onResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(container);

        // Visibility flag — paused while hero is off-screen
        let isVisible = true;

        // Animation loop
        function animate() {
            animFrameRef.current = requestAnimationFrame(animate);
            if (!isVisible) return; // skip rendering when off-screen
            const delta = clock.getDelta() * sceneDataRef.current.timeAcceleration;
            const t = clock.getElapsedTime();

            star.rotation.y += delta * 0.3;
            star.rotation.x += delta * 0.15;
            star.material.uniforms.time.value = t;

            orrery.children.forEach((c) => {
                if (c.userData.rotationSpeed) c.rotation.z += delta * c.userData.rotationSpeed;
            });

            planets.forEach((p) => {
                p.group.rotation.y += delta * p.group.userData.orbitSpeed;
                p.body.rotation.y += delta * p.body.userData.selfRotation;
                p.body.rotation.z += delta * p.body.userData.selfRotation * 0.3;
                p.material.uniforms.time.value = t;
            });

            particleSystems.forEach((ps) => {
                ps.system.geometry.attributes.position.needsUpdate = true;
            });

            for (let i = activeEffects.length - 1; i >= 0; i--) {
                const e = activeEffects[i];
                const elapsed = t - e.startTime;
                if (elapsed > e.duration) {
                    e.end();
                    activeEffects.splice(i, 1);
                } else {
                    e.update(elapsed, delta);
                }
            }

            controls.update();
            composer.render(delta);
        }
        animate();

        // Pause render loop when hero scrolls out of view
        const visibilityObserver = new IntersectionObserver(
            (entries) => { isVisible = entries[0].isIntersecting; },
            { threshold: 0.05 }
        );
        visibilityObserver.observe(container);

        // Cleanup
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            renderer.dispose();
            composer.dispose();
            controls.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // ── Button handlers ──
    const handleResetView = useCallback(() => {
        const d = sceneDataRef.current;
        if (!d) return;
        d.controls.reset();
        d.camera.position.set(25, 20, 25);
        d.controls.update();
    }, []);

    const handleActivateResonance = useCallback(() => {
        const d = sceneDataRef.current;
        if (!d || d.isResonanceActive) return;
        d.setResonanceActive(true);
        d.planets.forEach((p) => (p.body.userData.baseOrbitSpeed = p.group.userData.orbitSpeed));

        const activationEffect = {
            type: "activation",
            startTime: d.clock.getElapsedTime(),
            duration: 8,
            update(elapsed) {
                const prog = elapsed / this.duration;
                const intens = Math.sin(prog * Math.PI) * 3;
                d.starLight.intensity = 3 + intens * 3;
                d.star.material.uniforms.intensity.value = 1 + intens * 2;
                d.metalMaterial.emissiveIntensity = 0.4 + intens * 2;
                d.planets.forEach((p) => {
                    p.group.userData.orbitSpeed = p.body.userData.baseOrbitSpeed * (1 + intens * 1.5);
                    p.material.uniforms.energy.value = intens;
                });
            },
            end() {
                d.starLight.intensity = 3;
                d.star.material.uniforms.intensity.value = 1;
                d.metalMaterial.emissiveIntensity = 0.4;
                d.planets.forEach((p) => {
                    p.group.userData.orbitSpeed = p.body.userData.baseOrbitSpeed;
                    p.material.uniforms.energy.value = 0;
                });
                d.setResonanceActive(false);
            },
        };
        d.activeEffects.push(activationEffect);

        for (let i = 0; i < d.planets.length; i++) {
            d.createEnhancedArc(
                d.planets[i].body,
                i === 0 ? d.star : d.planets[i - 1].body,
                6
            );
        }
    }, []);

    const handleTimeAccel = useCallback(() => {
        const d = sceneDataRef.current;
        if (!d) return;
        const next = d.timeAcceleration === 1 ? 3 : d.timeAcceleration === 3 ? 0.5 : 1;
        d.setTimeAcceleration(next);
        setTimeLabel(`${next}x`);
    }, []);

    const handleToggleTheme = useCallback(() => {
        const d = sceneDataRef.current;
        if (!d) return;
        const next = (d.currentThemeIndex + 1) % themes.length;
        d.setThemeIndex(next);
        d.applyTheme(next);
        setThemeLabel(themes[next].name);
    }, []);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", minHeight: "400px" }}>
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                    borderRadius: "1rem",
                    overflow: "hidden",
                }}
            />
        </div>
    );
};

export default OrreryExperience;
