// src/models/piano.jsx
import React, {
  useState,
  useImperativeHandle,
  useRef,
  forwardRef,
  Suspense,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as Tone from "tone";

const blackKeyIndices = [
  2, 4, 7, 9, 11, 14, 16, 19, 21, 23, 26, 28, 31, 33, 35, 38, 40, 43, 45, 47,
  50, 52, 55, 57, 59, 62, 64, 67, 69, 71, 74, 76,
];

function generateFullKeyNoteMap(startOctave = 3, totalKeys = 79) {
  const notes = {};
  const chromaticScale = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  let octave = startOctave;

  for (let i = 0; i < totalKeys; i++) {
    const noteName = chromaticScale[i % 12];
    if (i > 0 && i % 12 === 0) {
      octave++;
    }
    notes[i] = noteName + octave;
  }
  return notes;
}

const keyIndexToNote = generateFullKeyNoteMap();

function PianoKey({ mesh, isBlackKey, note, pressedExternal }) {
  const [pressedInternal, setPressedInternal] = useState(false);
  const pressed =
    pressedExternal !== undefined ? pressedExternal : pressedInternal;
  const pressOffset = -0.05;

  return (
    <mesh
      geometry={mesh.geometry}
      material={mesh.material}
      position={[
        mesh.position.x,
        mesh.position.y + (pressed ? pressOffset : 0),
        mesh.position.z,
      ]}
      rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
      scale={mesh.scale}
      castShadow
      receiveShadow
    />
  );
}

function PianoModel({ url, modelRef, pressedKeys }) {
  const { nodes } = useGLTF(url);

  return (
    <group ref={modelRef} scale={[13, 13, 13]}>
      {Object.entries(nodes)
        .filter(([name]) => name.startsWith("Plane"))
        .map(([name, mesh]) => {
          if (name === "Plane") {
            return (
              <mesh
                key={name}
                geometry={mesh.geometry}
                material={mesh.material}
                position={[mesh.position.x, mesh.position.y, mesh.position.z]}
                rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
                scale={mesh.scale}
                castShadow
                receiveShadow
              />
            );
          } else {
            const index = parseInt(name.replace("Plane", ""), 10);
            const isBlackKey = blackKeyIndices.includes(index);
            return (
              <PianoKey
                key={name}
                mesh={mesh}
                isBlackKey={isBlackKey}
                note={keyIndexToNote[index]}
                pressedExternal={pressedKeys ? pressedKeys[index] : false}
              />
            );
          }
        })}
    </group>
  );
}

const PianoK = forwardRef((props, ref) => {
  const modelRef = useRef();
  const controlsRef = useRef();
  const [audioStarted, setAudioStarted] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({});

  // Create synth once, exposed via ref
  const synthRef = useRef();
  if (!synthRef.current) {
    synthRef.current = new Tone.Synth().toDestination();
  }

  useImperativeHandle(ref, () => ({
    setPressedKeys: (keys) => setPressedKeys(keys),
    synth: synthRef.current,
  }));

  const startAudio = async () => {
    try {
      await Tone.start();
      setAudioStarted(true);
      console.log("AudioContext started");
    } catch (error) {
      console.error("Tone.js start failed", error);
    }
  };

  return (
    <>
      {!audioStarted && (
        <button
          onClick={startAudio}
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            padding: "1em 2em",
            fontSize: "1rem",
            zIndex: 2000,
            cursor: "pointer",
          }}
        >
          Click to Enable Sound
        </button>
      )}
      <Canvas
        shadows
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 20, 50], fov: 55 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} castShadow />
        <Suspense fallback={null}>
          <PianoModel
            url="/ElectricPiano.glb"
            modelRef={modelRef}
            pressedKeys={pressedKeys}
          />
          <OrbitControls ref={controlsRef} />
        </Suspense>
      </Canvas>
    </>
  );
});

export default PianoK;
