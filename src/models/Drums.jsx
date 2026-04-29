import React, { Suspense, useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as Tone from "tone";

const nameMap = {
  Object_70: "bass", // bass center
  Object_9: "tomFloor", // tom floor center
  Object_56: "snare", // snare drum center
  Object_104: "tomMid", // tom mid center
  Object_95: "tomHigh", // tom high center
  Object_16: "cymbalRide", // cymbal ride
  Object_27: "cymbalCrash", // cymbal crash
  Object_38: "cymbalHiHat", // cymbal hihat
  Object_88: "cymbalRide", // cymbal ride (duplicate)
};

const interactiveParts = new Set(Object.values(nameMap));
const pressOffset = -0.1;

export function DrumsModel({ url }) {
  const { scene } = useGLTF(url);
  const partStates = useRef({});
  const [audioStarted, setAudioStarted] = useState(false);

  // Tone.js synth refs
  const kickSynth = useRef(null);
  const snareNoise = useRef(null);
  const hihatNoise = useRef(null);
  const tomSynth = useRef(null);
  const cymbalSynth = useRef(null);

  useEffect(() => {
    kickSynth.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 8,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
      oscillator: { type: "sine" },
    }).toDestination();

    snareNoise.current = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      volume: -5,
    }).toDestination();

    hihatNoise.current = new Tone.MetalSynth({
      frequency: 6000,
      envelope: { attack: 0.001, decay: 0.1, release: 0.02 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      volume: -12,
    }).toDestination();

    tomSynth.current = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 7,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.8 },
    }).toDestination();

    cymbalSynth.current = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 1.2, release: 0.6 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 8000,
      octaves: 1.5,
      volume: -15,
    }).toDestination();
  }, []);

  const startAudio = async () => {
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
      console.log("Audio started");
    }
  };

  useEffect(() => {
    // Save original Y position for press simulation
    scene.traverse((child) => {
      if (child.isMesh && child.userData.originalY === undefined) {
        child.userData.originalY = child.position.y;
      }
    });
  }, [scene]);

  function playDrumSound(drumName) {
    switch (drumName) {
      case "bass":
        kickSynth.current.triggerAttackRelease("C2", "8n");
        break;
      case "snare":
        snareNoise.current.triggerAttackRelease("16n");
        break;
      case "tomFloor":
        tomSynth.current.triggerAttackRelease("G2", "8n");
        break;
      case "tomMid":
        tomSynth.current.triggerAttackRelease("A2", "8n");
        break;
      case "tomHigh":
        tomSynth.current.triggerAttackRelease("B2", "8n");
        break;
      case "cymbalHiHat":
        hihatNoise.current.triggerAttackRelease("16n");
        break;
      case "cymbalRide":
      case "cymbalCrash":
        cymbalSynth.current.triggerAttackRelease("C4", "4n");
        break;
      default:
        break;
    }
  }

  function onPointerDown(e) {
    const meshName = e.object.name;
    const drumName = nameMap[meshName];
    if (drumName && interactiveParts.has(drumName)) {
      e.stopPropagation();
      partStates.current[meshName] = true;
      e.object.position.y = e.object.userData.originalY + pressOffset;

      startAudio().then(() => {
        playDrumSound(drumName);
      });
    }
  }

  function onPointerUp(e) {
    const meshName = e.object.name;
    const drumName = nameMap[meshName];
    if (drumName && interactiveParts.has(drumName)) {
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

export default function DrumsK() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 10, 35], fov: 45 }}
      shadows
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <Suspense fallback={null}>
        <DrumsModel url="/standard_drum_set.glb" />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}
