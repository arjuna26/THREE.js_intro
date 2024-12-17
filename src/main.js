import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Import the GLTFLoader

// screen, camera renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 3, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.setZ(30);
camera.position.setX(-3);

// add scene light source

// point light with shadow, from three.js docs
const light = new THREE.PointLight( 0xffffff, 200, 0, 2 );
light.position.set( 3, 25, 10 );
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 1; // default
light.shadow.camera.far = 100; // default

//light helper, visualize where the light is and which direction it is facing on the browser
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

// ambient light, lights up the entire scene
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// Load a 3D model
function loadModel() {
  const loader = new GLTFLoader();
  loader.load(
    'cookies_crunchyscan.glb', // Replace with the actual path to your GLTF/GLB model
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, -10); // Set the position of the model
      model.scale.set(200, 200, 200); // Scale the model if needed
      model.castShadow = true; // Allow the model to cast shadows
      model.receiveShadow = true; // Allow the model to receive shadows
      scene.add(model);
    },
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Progress logging
    },
    (error) => {
      console.error('An error occurred while loading the model:', error);
    }
  );
}

// Call the function to load the model
loadModel();

const cubeImage = new THREE.TextureLoader().load('cubeimg2.jpg');

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(20, 20, 20),
  new THREE.MeshBasicMaterial({ map: cubeImage })
);
cube.position.setX(-80);
scene.add(cube);  

// add randomly placed stars to the background of the scene

function addStar() {
  const geometry = new THREE.SphereGeometry(0.15, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.receiveShadow = true;

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(600).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('darknavyspace.jpg');
scene.background = spaceTexture;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  // rotate the cube object when user scrolls
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.005;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
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
  requestAnimationFrame( animate );
  // cube.rotation.x += 0.001;
  // cube.rotation.y += 0.005;
  renderer.render( scene, camera );
  
}
animate()


