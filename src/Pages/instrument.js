// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// //
// let scene, camera, renderer, controls, pedestal, model;
// let audioContext, analyser, dataArray, source;
// const spotlight1 = new THREE.SpotLight();
// const spotlight2 = new THREE.SpotLight();

// export function initStage(overlay) {
//   const container = document.getElementById("instrument-canvas");

//   // Scene
//   scene = new THREE.Scene();
//   scene.fog = new THREE.FogExp2(0x000000, 0.0008);

//   // Camera
//   camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
//   camera.position.set(0, 2, 6);

//   // Renderer
//   renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//   renderer.setSize(innerWidth, innerHeight);
//   renderer.setPixelRatio(devicePixelRatio);
//   renderer.outputEncoding = THREE.sRGBEncoding;
//   renderer.toneMapping = THREE.ACESFilmicToneMapping;
//   renderer.shadowMap.enabled = true;
//   container.appendChild(renderer.domElement);

//   // Controls
//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;
//   controls.autoRotate = true;
//   controls.autoRotateSpeed = 0.5;

//   // LIGHTS
//   const ambient = new THREE.AmbientLight(0x404040, 0.5);
//   scene.add(ambient);

//   spotlight1.color.setHSL(0.6, 1, 0.8);
//   spotlight1.power = 30;
//   spotlight1.position.set(5, 8, 5);
//   spotlight1.angle = 0.4;
//   spotlight1.penumbra = 0.6;
//   spotlight1.castShadow = true;
//   scene.add(spotlight1);

//   spotlight2.color.setHSL(0.1, 1, 0.8);
//   spotlight2.power = 30;
//   spotlight2.position.set(-5, 8, 5);
//   scene.add(spotlight2);

//   // CRYSTAL PEDESTAL
//   const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.3, 6);
//   const pedestalMat = new THREE.MeshPhysicalMaterial({
//     color: 0x88ffff,
//     emissive: 0x0088ff,
//     roughness: 0,
//     metalness: 0.8,
//     clearcoat: 1,
//     clearcoatRoughness: 0,
//     transmission: 0.9,
//     thickness: 0.5,
//   });
//   pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
//   pedestal.position.y = 0.15;
//   pedestal.rotation.y = Math.PI / 6;
//   scene.add(pedestal);

//   // GLOW RING
//   const ring = new THREE.Mesh(
//     new THREE.RingGeometry(1.4, 1.8, 32),
//     new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
//   );
//   ring.rotation.x = -Math.PI / 2;
//   ring.position.y = 0.01;
//   scene.add(ring);

//   // LOAD INSTRUMENT
//   const loader = new GLTFLoader();
//   loader.load(
//     "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/PrimaryIonDrive.glb",
//     (gltf) => {
//       model = gltf.scene;
//       model.scale.set(2, 2, 2);
//       model.position.y = 0.8;
//       model.traverse((n) => {
//         if (n.isMesh) {
//           n.castShadow = true;
//           n.receiveShadow = true;
//         }
//       });
//       scene.add(model);
//     },
//     undefined,
//     console.error
//   );

//   // AUDIO REACTIVITY
//   setupAudio();

//   // CAMERA FLY-IN
//   gsap.from(camera.position, {
//     z: 15,
//     y: 5,
//     duration: 3,
//     ease: "power2.out",
//     onUpdate: () => controls.update(),
//   });

//   // ANIMATE
//   const clock = new THREE.Clock();
//   function animate() {
//     const t = clock.getElapsedTime();

//     // Pedestal spin
//     if (pedestal) pedestal.rotation.y = t * 0.2;

//     // Ring pulse
//     if (ring) {
//       ring.scale.setScalar(1 + 0.1 * Math.sin(t * 3));
//       ring.material.opacity = 0.5 + 0.5 * Math.sin(t * 5);
//     }

//     // Sound-reactive lights
//     if (analyser) {
//       analyser.getByteFrequencyData(dataArray);
//       const bass = dataArray[0] / 255;
//       spotlight1.power = 20 + bass * 50;
//       spotlight2.power = 20 + bass * 50;
//       pedestal.material.emissiveIntensity = bass * 2;
//     }

//     controls.update();
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }
//   animate();

//   // RESIZE
//   window.addEventListener("resize", () => {
//     camera.aspect = innerWidth / innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(innerWidth, innerHeight);
//   });

//   // CLICK TO PLAY NOTE
//   renderer.domElement.addEventListener("click", () => {
//     playNote();
//   });

//   return () => {
//     renderer.domElement.remove();
//     window.removeEventListener("resize", onResize);
//   };
// }

// // AUDIO SETUP
// function setupAudio() {
//   audioContext = new (window.AudioContext || window.webkitAudioContext)();
//   analyser = audioContext.createAnalyser();
//   analyser.fftSize = 256;
//   dataArray = new Uint8Array(analyser.frequencyBinCount);

//   navigator.mediaDevices
//     .getUserMedia({ audio: true })
//     .then((stream) => {
//       source = audioContext.createMediaStreamSource(stream);
//       source.connect(analyser);
//     })
//     .catch((err) => {
//       // Fallback: generate tone on click
//       console.log("Mic denied. Using click tones.");
//     });
// }

// function playNote() {
//   if (!audioContext) return;
//   const osc = audioContext.createOscillator();
//   const gain = audioContext.createGain();
//   osc.type = "sine";
//   osc.frequency.setValueAtTime(
//     440 + Math.random() * 880,
//     audioContext.currentTime
//   );
//   gain.gain.setValueAtTime(0.3, audioContext.currentTime);
//   gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
//   osc.connect(gain).connect(audioContext.destination);
//   osc.start();
//   osc.stop(audioContext.currentTime + 0.5);
// }
