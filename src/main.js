import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
camera.position.z = 500;
camera.position.y = 200;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(windowWidth, windowHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 150;
controls.maxDistance = 450;

// GLTF loader for models
// Galaxy group already defined, removed duplicate initialization
// Removed duplicate addition of galaxyGroup
const galaxyGroup = new THREE.Group();
const loader = new GLTFLoader();

// Optimize star rendering with Points
function generateGalaxyWithPoints(numStars, spiralArms, armSpread, radiusSpread) {
    const axisStars = Math.floor(numStars * 0.2); // Number of stars along the axis
    const axisSpreadBase = Math.max(50, numStars * 0.0009); // Spread around the axis

    const axisPositions = [];
    const axisColors = [];
    const baseColorAxis = new THREE.Color('#fef7b8');

    for (let i = 0; i < axisStars; i++) {
        const y = (i / axisStars) * 2 * radiusSpread - radiusSpread;
        const taperFactor = Math.max(0.5, 1 - Math.abs(y) / (radiusSpread * 2) + (Math.random() - 0.5) * 0.3); // Softer taper with smoother randomness
        const axisSpread = axisSpreadBase * Math.pow(taperFactor, 0.8); // Smooth and less sharp taper
        const x = Math.random() * axisSpread - axisSpread / 2;
        const z = Math.random() * axisSpread - axisSpread / 2;

        axisPositions.push(x, y, z);

        // Add random star color for axis
        const colorVariation = (Math.random() - 0.5) * 0.2;
        const color = baseColorAxis.clone().offsetHSL(0, 0, colorVariation);
        axisColors.push(color.r, color.g, color.b);
    }

    const axisGeometry = new THREE.BufferGeometry();
    axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute(axisPositions, 3));
    axisGeometry.setAttribute('color', new THREE.Float32BufferAttribute(axisColors, 3));

    const axisMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        sizeAttenuation: true,
    });

    const axisPoints = new THREE.Points(axisGeometry, axisMaterial);
    galaxyGroup.add(axisPoints);
    const positions = [];
    const colors = [];
    const baseColorSpiral = new THREE.Color('#fef7b8');

    for (let i = 0; i < numStars; i++) {
        const angle = (i / numStars) * Math.PI * 2 * spiralArms;
        const radius = Math.random() * radiusSpread;
        const offsetX = Math.random() * armSpread - armSpread / 2;
        const offsetY = Math.random() * armSpread - armSpread / 2;

        const x = Math.cos(angle) * radius + offsetX;
        const y = offsetY / 2; // Slightly flatter galaxy
        const z = Math.sin(angle) * radius + offsetY;

        positions.push(x, y, z);

        // Add random star color
        const colorVariation = (Math.random() - 0.5) * 0.2; // Slight variation for brightness
        const color = baseColorSpiral.clone().offsetHSL(0, 0, colorVariation);
        colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    return points;
}

// Load starry sky texture and create environment sphere
const cosmosTexture = new THREE.TextureLoader().load('./src/assets/hazy.png');
const cosmosMaterial = new THREE.MeshStandardMaterial({
    map: cosmosTexture,
    side: THREE.BackSide,
});
const sphereGeometry = new THREE.SphereGeometry(500, 32, 32);
const environmentSphere = new THREE.Mesh(sphereGeometry, cosmosMaterial);
scene.add(environmentSphere);

// Generate a spiral galaxy with 100,000 stars, 4 arms, and appropriate spreads
const stars = generateGalaxyWithPoints(8500, 4, 10, 100);

// Ambient light for overall illumination
const ambientLight = new THREE.AmbientLight('#fff', 0.5); // Soft white light
scene.add(ambientLight);

// Create a group for all objects in the scene

scene.children.forEach(child => {
    if (child !== camera && child !== controls) {
        galaxyGroup.add(child);
    }
});
scene.add(galaxyGroup);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the entire galaxy group
    galaxyGroup.rotation.y += 0.0005; // Adjust speed of rotation here
    stars.rotation.y += 0.0005;

    controls.update();
    renderer.render(scene, camera);
}

animate();
