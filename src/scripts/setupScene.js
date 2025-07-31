import * as THREE from "three";

export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
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
  return { camera, renderer };
}

export function setupLights(scene) {
  // Point light
  const light = new THREE.PointLight(0xfffff0, 4, 0, 0.1);
  light.position.set(64, 10, -90);
  light.castShadow = true;
  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
  light.shadow.camera.near = 1;
  scene.add(light);

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0xfffff0, 0.5);
  directionalLight.position.set(-50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  scene.add(directionalLight);

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
}
