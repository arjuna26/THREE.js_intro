import './style.css'

import * as THREE from 'three';

// screen, camera renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.setZ(30);

// add scene light source

// point light, basically a spot light
const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(6,6,6)

// ambient light, lights up the entire scene
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(pointLight, ambientLight)

// create new "geometry", basically just a shape and add it to the scene
const geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 )
const material = new THREE.MeshStandardMaterial( { color: 0xffff00, } );
const torusKnot = new THREE.Mesh( geometry, material );

scene.add(torusKnot)

// infinte loop to continously render the scene
function animate() {
  requestAnimationFrame( animate );
  torusKnot.rotation.x += 0.01;
  torusKnot.rotation.y += 0.005;
  renderer.render( scene, camera );
  
}
animate()


