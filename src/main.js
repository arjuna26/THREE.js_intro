import "./style.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// screen, camera renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  3,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


// add scene light source

// point light with shadow, from three.js docs
const light = new THREE.PointLight(0xffffff, 2, 0, 0);
light.position.set(3, 15, 10);
light.castShadow = true; // default false
scene.add(light);

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 1; // default
// light.shadow.camera.far = 100; // default

// Add a directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0xfffff0, 0.5);
directionalLight.position.set(-50, 50, 50); // Position the light to shine diagonally
directionalLight.castShadow = true; // Enable shadows

// Configure shadow properties for better quality
directionalLight.shadow.mapSize.width = 2048; // Increase shadow resolution
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;

scene.add(directionalLight);

// ambient light, lights up the entire scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Track the number of models that need to be loaded
let modelsToLoad = 5; // Total number of models you are loading
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
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Progress logging
    },
    (error) => {
      console.error("An error occurred while loading the model:", error);
    }
  );
}

// create 3d models, basically here i am loading each model from its .glb file using the function ^^
let moonModel;
loadModel("moon.glb", (model) => {
  moonModel = model; // Store the loaded model in a variable
  moonModel.position.set(-150, 0, -30); 
  moonModel.scale.set(12, 16, 12);
  console.log("Moon model loaded:", moonModel);
});

let earthModel;
loadModel("earth.glb", (model) => {
  earthModel = model; // Store the loaded model in a variable
  earthModel.position.set(-110, -20, -60); 
  earthModel.scale.set(24, 32, 24);
  console.log("Earth model loaded:", earthModel);
});

let saturnModel;
loadModel("saturn.glb", (model) => {
  saturnModel = model; // Store the loaded model in a variable
  saturnModel.position.set(180, 0, -60); 
  saturnModel.scale.set(22, 30, 22);
  saturnModel.rotation.x += 0.4;
  console.log("Saturn model loaded:", saturnModel);
});

let marsModel;
loadModel("mars.glb", (model) => {
  marsModel = model; // Store the loaded model in a variable
  marsModel.position.set(150, -100, -85); 
  marsModel.scale.set(3, 3, 3);
  console.log("mars model loaded:", marsModel);
});

let rocketModel;
loadModel("rocket-ship.glb", (model) => {
  rocketModel = model; // Store the loaded model in a variable
  rocketModel.position.set(-2, 1, -25); 
  rocketModel.scale.set(7, 7, 7);
  rocketModel.rotation.x -= 1.4;
  rocketModel.rotation.y += 0.22;
  console.log("rocket model loaded:", rocketModel);
});

// add randomly placed stars to the background of the scene
const stars = [];

function addStar() {
  const geometry = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xfff5b0 });
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

  camera.position.z = t * -0.02;

  if (rocketModel){
    rocketModel.rotation.z += 0.0003; // Rotate the model around its Y-axis
    rocketModel.position.x += 0.75; // Move the model to the right
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
    if(rocketModel.position.y) {
      rocketModel.position.y = 1 + Math.sin(time) * 0.5; // Hover in Y direction
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
      star.material.color.r = Math.max(0.8, currentBrightness - star.pulseSpeed);
      star.material.color.g = Math.max(0.8, currentBrightness - star.pulseSpeed);
      star.material.color.b = Math.max(0.8, currentBrightness - star.pulseSpeed);

      if (currentBrightness <= 0.8) star.pulseDirection = 1; // Reverse direction
    }
  });

  // Rotate the models if they have been loaded
  if (moonModel){
    moonModel.rotation.y += 0.0025; // Rotate the model around its Y-axis
  }
  if (earthModel){
    earthModel.rotation.y += 0.005; // Rotate the model around its Y-axis
  }
  if (saturnModel){
    saturnModel.rotation.y += 0.02; // Rotate the model around its Y-axis
  }
  if (marsModel){
    marsModel.rotation.y += 0.001; // Rotate the model around its Y-axis
  }

  renderer.render(scene, camera);
}
animate();