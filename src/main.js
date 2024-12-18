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
camera.position.setZ(30);
camera.position.setX(-3);

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
let modelsToLoad = 3; // Total number of models you are loading
let modelsLoaded = 0;

// Show the loading screen
document.body.classList.add("loading");

// Hide the loading screen when all models are loaded
function onModelLoaded() {
  modelsLoaded++;
  if (modelsLoaded === modelsToLoad) {
    document.getElementById("loading-screen").style.display = "none";
    document.body.classList.remove("loading");
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

      // Pass the loaded model to the callback
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

// create 3d models
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
  earthModel.position.set(-120, -20, -60); 
  earthModel.scale.set(24, 32, 24);
  console.log("Earth model loaded:", earthModel);
});

let saturnModel;
loadModel("saturn.glb", (model) => {
  saturnModel = model; // Store the loaded model in a variable
  saturnModel.position.set(180, 0, -60); 
  saturnModel.scale.set(22, 30, 22);
  saturnModel.rotation.x += 0.4;
  console.log("Earth model loaded:", saturnModel);
});

// add randomly placed stars to the background of the scene
const stars = [];

function addStar() {
  const geometry = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.receiveShadow = true;

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);

  // Store the star and its initial position
  stars.push({ star, initialPosition: { x, y, z } });
  scene.add(star);
}

Array(600).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load("darknavyspace.jpg");
scene.background = spaceTexture;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  // if (moonModel){
  //   moonModel.position.x += 1.5;
  // }

  camera.position.z = t * -0.02;
}

document.body.onscroll = moveCamera;
moveCamera();

// //Create a plane that receives shadows (but does not cast them)
// const planeGeometry = new THREE.PlaneGeometry( 64, 64, 20, 20 );
// const planeMaterial = new THREE.MeshDepthMaterial( { color: 0xffffff } )
// const plane = new THREE.Mesh( planeGeometry, planeMaterial );
// plane.receiveShadow = true;
// scene.add( plane );

// infinte loop to continously render the scene
function animate() {
  requestAnimationFrame(animate);

  // shake stars gently
  const time = Date.now() * 0.001; // Time in seconds

  stars.forEach(({ star, initialPosition }, index) => {
    const offset = index * 0.1; // Add a small offset per star to make motion unique
    star.position.x = initialPosition.x + Math.sin(time + offset) * 0.5; // Shake in X direction
    star.position.y = initialPosition.y + Math.cos(time + offset) * 0.5; // Shake in Y direction
  });

  // Rotate the model if it has been loaded
  if (moonModel){
    moonModel.rotation.y += 0.005; // Rotate the model around its Y-axis
  }
  if (earthModel){
    earthModel.rotation.y += 0.01; // Rotate the model around its Y-axis
  }
  if (saturnModel){
    saturnModel.rotation.y += 0.04; // Rotate the model around its Y-axis
  }
  renderer.render(scene, camera);
}
animate();
