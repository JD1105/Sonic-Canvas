import React, { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

// Use actual mesh names from your log
const interactiveParts = new Set([
  "Object_7",
  "Object_11",
  "Object_12",
  "Object_16",
  "Object_20",
  "Object_5",
]);
const pressOffset = -0.1;

function GuitarKitMesh({ url }) {
  const { scene } = useGLTF(url);
  const partStates = useRef({}); // track pressed state per mesh

  // Store original y-positions of all meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.userData.originalY === undefined) {
        child.userData.originalY = child.position.y;
      }
    });
  }, [scene]);

  function onPointerDown(e) {
    if (e.object && interactiveParts.has(e.object.name)) {
      e.stopPropagation();
      partStates.current[e.object.name] = true;
      e.object.position.y = e.object.userData.originalY + pressOffset;
    }
  }
  function onPointerUp(e) {
    if (e.object && interactiveParts.has(e.object.name)) {
      e.stopPropagation();
      partStates.current[e.object.name] = false;
      e.object.position.y = e.object.userData.originalY;
    }
  }

  return (
    <primitive
      object={scene}
      // vertical by default (no rotation prop)
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
      castShadow
      receiveShadow
    />
  );
}

export default function GuitarK() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 8, 35], fov: 45 }}
      shadows
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <Suspense fallback={null}>
        <GuitarKitMesh url="/guitar.glb" />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}
