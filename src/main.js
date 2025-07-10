import "./style.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { setupCamera, setupLights } from "./scripts/setupScene.js";

// Create scene
const scene = new THREE.Scene();

// Setup camera
const { camera, renderer } = setupCamera();

// Setup lights
setupLights(scene);

// Track the number of models that need to be loaded
let modelsToLoad = 7; // Total number of models you are loading
let modelsLoaded = 0;

// Show the loading screen
document.body.classList.add("loading");

// Hide the loading screen when all models are loaded
function onModelLoaded() {
  modelsLoaded++;
  if (modelsLoaded === modelsToLoad) {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.opacity = "0"; // Optional fade-out effect
    setTimeout(() => {
      loadingScreen.remove();
    }, 500); // Adjust timeout to match fade-out duration
  }
}

// Load a 3D model and use a callback to access the model
function loadModel(fileName, onLoadCallback) {
  const loader = new GLTFLoader();
  loader.load(
    fileName,
    (gltf) => {
      const model = gltf.scene;
      model.castShadow = true; // Allow the model to cast shadows
      model.receiveShadow = true; // Allow the model to receive shadows
      scene.add(model);

      // Pass the loaded model to the callback, we need a callback function to store the models properly in the variables,
      // otherwise the models will be undefined outside of the loader function. the Callback function is also useful for the loading screen
      if (onLoadCallback) {
        onLoadCallback(model);
      }

      onModelLoaded();
    },
    (xhr) => {
      // console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Progress logging
    },
    (error) => {
      console.error("An error occurred while loading the model:", error);
    }
  );
}

// Reusable function to load and configure models
function loadAndConfigureModel(
  fileName,
  position,
  scale,
  rotation = { x: 0, y: 0, z: 0 }
) {
  loadModel(fileName, (model) => {
    // Set rotation order to YXZ to prevent gimbal lock
    model.rotation.order = "YXZ";

    // Center the model's pivot point
    model.position.set(position.x, position.y, position.z);
    model.scale.set(scale.x, scale.y, scale.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);

    models[fileName] = model;
  });
}

// Object to store loaded models
const models = {};

// Load models using the reusable function
loadAndConfigureModel(
  "mercury.glb",
  { x: -120, y: -20, z: -60 },
  { x: 30, y: 46, z: 32 },
  { x: 0.1, y: 0, z: 0 }
);
loadAndConfigureModel(
  "venus.glb",
  { x: 70, y: -20, z: -50 },
  { x: 16, y: 24, z: 16 },
  { x: 0.1, y: 0, z: 0 }
);
loadAndConfigureModel(
  "mars.glb",
  { x: 120, y: -10, z: 20 },
  { x: 3, y: 4, z: 3 }
);
loadAndConfigureModel(
  "earth.glb",
  { x: -110, y: -10, z: 10 },
  { x: 24, y: 32, z: 24 }
);
loadAndConfigureModel(
  "moon.glb",
  { x: -150, y: 0, z: -30 },
  { x: 12, y: 16, z: 12 }
);

loadAndConfigureModel(
  "saturn.glb",
  { x: 250, y: 0, z: 10 },
  { x: 22, y: 30, z: 22 },
  { x: 0.4, y: 0, z: 0 }
);

loadAndConfigureModel(
  "rocket-ship.glb",
  { x: -2, y: 1, z: -25 },
  { x: 7, y: 7, z: 7 },
  { x: -1.4, y: 0.22, z: 0 }
);

// add randomly placed stars to the background of the scene
const stars = [];

function addStar() {
  const geometry = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    transparent: true, // Enable transparency
    opacity: 0.6, // Set opacity (0 is fully transparent, 1 is fully opaque)
  });
  const star = new THREE.Mesh(geometry, material);
  // Add a custom property for pulsing
  star.pulseDirection = 1; // 1 = brightening, -1 = dimming
  star.pulseSpeed = THREE.MathUtils.randFloat(0.01, 0.03); // Random speed for variation

  // Enable shadows for the stars
  star.receiveShadow = true;

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);

  // Store the star and its initial position
  stars.push({ star, initialPosition: { x, y, z } });
  scene.add(star);
}

Array(1200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load("darknavyspace.jpg");
scene.background = spaceTexture;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  camera.position.z = t * -0.04;

  if (models["rocket-ship.glb"]) {
    models["rocket-ship.glb"].rotation.z += -0.008; // Rotate the model around its Y-axis
    models["rocket-ship.glb"].position.x += 0.15; // Move the model to the right
    models["rocket-ship.glb"].position.y += 1; // Hover in Y direction
  }
  if (models["mercury.glb"]) {
     models["mercury.glb"].position.zx -= 6; // Rotate the model around its Y-axis

  }
}

document.body.onscroll = moveCamera;
moveCamera();

// infinte loop to continously render the scene
function animate() {
  requestAnimationFrame(animate);

  // Move stars around the scene
  const time = Date.now() * 0.001; // Time in seconds

  stars.forEach(({ star, initialPosition }, index) => {
    // // This can be used to move geometries or models around in an animation loop, also for a list of objects,
    // // such as the stars in this project. This could be reused with a single object as well. Use properties of
    // // sin/cos to create circular random motion, and add a small offset to each object to make the motion unique.

    const offset = index * 0.1; // Add a small offset per star to make motion unique
    star.position.x = initialPosition.x + Math.sin(time + offset) * 0.5; // Shake in X direction
    star.position.y = initialPosition.y + Math.cos(time + offset) * 0.5; // Shake in Y direction

    // // This effect can be used to create a pulsing effect for geometries or models. The brightness of the object
    // // is updated in the animation loop, creating a pulsing effect between two colors. This can be used to draw
    // // attention to an object.

    // Get current brightness (based on the R/G/B values, which are the same for white and gray)
    const currentBrightness = star.material.color.r;

    // // Here, I used the same effect as the stars, but on the rocketship to make it look like its hovering!
    // // I also added a rotation to the rocketship to make it look like its flying through space.
    if (models["rocket-ship.glb"].position.y) {
      models["rocket-ship.glb"].position.y = 1 + Math.sin(time) * 0.5; // Hover in Y direction
    }

    // Update brightness
    if (star.pulseDirection === 1) {
      // Brightening
      star.material.color.r = Math.min(1, currentBrightness + star.pulseSpeed);
      star.material.color.g = Math.min(1, currentBrightness + star.pulseSpeed);
      star.material.color.b = Math.min(1, currentBrightness + star.pulseSpeed);

      if (currentBrightness >= 1) star.pulseDirection = -1; // Reverse direction
    } else {
      // Dimming
      star.material.color.r = Math.max(
        0.8,
        currentBrightness - star.pulseSpeed
      );
      star.material.color.g = Math.max(
        0.8,
        currentBrightness - star.pulseSpeed
      );
      star.material.color.b = Math.max(
        0.8,
        currentBrightness - star.pulseSpeed
      );

      if (currentBrightness <= 0.8) star.pulseDirection = 1; // Reverse direction
    }
  });

  // Rotate the models if they have been loaded
  if (models["moon.glb"]) {
    models["moon.glb"].rotation.y += 0.0025; // Rotate the model around its Y-axis
  }
  if (models["earth.glb"]) {
    models["earth.glb"].rotation.y += 0.005; // Rotate the model around its Y-axis
  }
  if (models["saturn.glb"]) {
    models["saturn.glb"].rotation.y += 0.02; // Rotate the model around its Y-axis
  }
  if (models["mars.glb"]) {
    models["mars.glb"].rotation.y += 0.001; // Rotate the model around its Y-axis
  }
  if (models["venus.glb"]) {
    models["venus.glb"].rotation.y += 0.002; // Rotate the model around its Y-axis
  }
  if (models["mercury.glb"]) {
    models["mercury.glb"].rotation.y += 0.005; // Rotate the model around its Y-axis
  }

  renderer.render(scene, camera);
}
animate();
