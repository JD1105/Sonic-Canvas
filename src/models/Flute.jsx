import React, { Suspense, useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as Tone from "tone";

// Map mesh names to flute note roles or pitches
const nameMap = {
  "defaultmaterial.001": "C4",
  "defaultmaterial.002": "D4",
  "defaultmaterial.003": "E4",
  "defaultmaterial.004": "F4",
  "defaultmaterial.005": "G4",
  "defaultmaterial.006": "A4",
  "defaultmaterial.007": "B4",
  "defaultmaterial.008": "C5",
};

const interactiveParts = new Set(Object.keys(nameMap));
const pressOffset = -0.05;

export function FluteModel({ url }) {
  const { scene } = useGLTF(url);
  const partStates = useRef({});
  const [audioStarted, setAudioStarted] = useState(false);

  // Create a simple flute-like synth
  const fluteSynth = useRef(null);

  useEffect(() => {
    fluteSynth.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).toDestination();
  }, []);

  const startAudio = async () => {
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
      console.log("Audio started for flute");
    }
  };

  useEffect(() => {
    // Store original Y positions
    scene.traverse((child) => {
      if (child.isMesh && child.userData.originalY === undefined) {
        child.userData.originalY = child.position.y;
      }
    });
  }, [scene]);

  function playFluteNote(note) {
    if (fluteSynth.current) {
      fluteSynth.current.triggerAttackRelease(note, "8n");
    }
  }

  function onPointerDown(e) {
    const meshName = e.object.name;
    if (interactiveParts.has(meshName)) {
      console.log("Pointer down on:", meshName);
      e.stopPropagation();
      partStates.current[meshName] = true;
      e.object.position.y = e.object.userData.originalY + pressOffset;

      startAudio().then(() => {
        playFluteNote(nameMap[meshName]);
      });
    }
  }

  function onPointerUp(e) {
    const meshName = e.object.name;
    if (interactiveParts.has(meshName)) {
      e.stopPropagation();
      partStates.current[meshName] = false;
      e.object.position.y = e.object.userData.originalY;
    }
  }

  return (
    <primitive
      object={scene}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
      castShadow
      receiveShadow
    />
  );
}

export default function FluteK() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 3, 7], fov: 35 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
      <Suspense fallback={null}>
        <FluteModel url="/flute.glb" />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}
