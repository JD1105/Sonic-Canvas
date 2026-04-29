import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  Suspense,
} from "react";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as Tone from "tone";
import { Link } from "react-router-dom";

// --- Finger State Utilities ---
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isThumbOpen(landmarks, handedness) {
  if (!landmarks) return null;
  const tip = landmarks[4];
  const ip = landmarks[3];
  const mcp = landmarks[2];
  if (handedness === "Right") {
    return tip.x < ip.x && tip.x < mcp.x;
  } else {
    return tip.x > ip.x && tip.x > mcp.x;
  }
}

function isFingerOpen(landmarks, tipIndex, pipIndex) {
  if (!landmarks) return null;
  return (
    dist(landmarks[tipIndex], landmarks[0]) >
    dist(landmarks[pipIndex], landmarks[0])
  );
}

function getFingerStates(landmarks, handedness) {
  if (!landmarks) return ["null", "null", "null", "null", "null"];
  return [
    isThumbOpen(landmarks, handedness) ? "open" : "closed",
    isFingerOpen(landmarks, 8, 6) ? "open" : "closed",
    isFingerOpen(landmarks, 12, 10) ? "open" : "closed",
    isFingerOpen(landmarks, 16, 14) ? "open" : "closed",
    isFingerOpen(landmarks, 20, 18) ? "open" : "closed",
  ];
}

// --- Piano 3D Model & Tone.js Synth ---

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
    if (i > 0 && i % 12 === 0) octave++;
    notes[i] = noteName + octave;
  }
  return notes;
}
const keyIndexToNote = generateFullKeyNoteMap();
const gridNotes = [
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

function PianoKey({ mesh, pressedExternal }) {
  const pressOffset = -0.05;
  return (
    <mesh
      geometry={mesh.geometry}
      material={mesh.material}
      position={[
        mesh.position.x,
        mesh.position.y + (pressedExternal ? pressOffset : 0),
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
            return (
              <PianoKey
                key={name}
                mesh={mesh}
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
  const synthRef = useRef();

  if (!synthRef.current) {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
  }

  useImperativeHandle(ref, () => ({
    setPressedKeys: (keys) => setPressedKeys(keys),
    synth: synthRef.current,
  }));

  async function startAudio() {
    try {
      await Tone.start();
      setAudioStarted(true);
      console.log("AudioContext started");
    } catch (error) {
      console.error("Tone.js start failed", error);
    }
  }

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
        style={{ width: "100%", height: "100vh" }}
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

// --- Piano Logic: Handles finger states and plays synth notes, animates keys ---

let prevLeft = [];
let selectedOctave = 0;

function getState(states, fingers) {
  for (const finger of fingers) {
    if (states[finger] === "closed") return "closed";
  }
  return "open";
}

let previousFingerY = null;
let lastTriggeredKey = null;

function countOpenFingers(states) {
  if (!states || states.length === 0) return 0;
  return states.filter((s) => s === "open").length;
}
function getGridKeyIndex(x, y) {
  if (x === null || y === null) return null;

  const cols = 4;
  const rows = 3;

  const col = Math.floor(x * cols);
  const row = Math.floor(y * rows);

  if (col < 0 || col > 3) return null;
  if (row < 0 || row > 2) return null;

  return row * cols + col;
}
let tapState = "up";
let tapThreshold = 0.015;
function pianoFingerLogic(
  rightStates = [],
  leftLandmarks = null,
  synth,
  setKeysPressed,
) {
  if (!synth || !leftLandmarks) return;

  const indexFinger = leftLandmarks[8];

  if (!indexFinger) return;

  // ---------------------------
  // OCTAVE SELECTION (LEFT HAND)
  // ---------------------------

  let octave = countOpenFingers(rightStates);
  if (octave === 0) octave = 6;

  // ---------------------------
  // KEY SELECTION (RIGHT HAND)
  // ---------------------------

  const keyIndex = getGridKeyIndex(indexFinger.x, indexFinger.y);

  if (keyIndex === null) return;

  const finalKeyIndex = octave * 12 + keyIndex;

  const note = keyIndexToNote[finalKeyIndex];

  // ---------------------------
  // TAP DETECTION
  // ---------------------------

  if (previousFingerY !== null) {
    const movement = previousFingerY - indexFinger.y;

    // finger going down
    if (movement > tapThreshold && tapState === "up") {
      synth.triggerAttackRelease(
        note,
        "8n",
        undefined,
        Math.min(movement * 8, 1),
      );

      setKeysPressed({ [finalKeyIndex]: true });

      tapState = "down";
      lastTriggeredKey = finalKeyIndex;
    }

    // finger going up again
    if (movement < -tapThreshold) {
      tapState = "up";
    }
  }

  previousFingerY = indexFinger.y;

  previousFingerY = indexFinger.y;
}

// --- Hand Landmark Drawing & Instrument Selector ---

function drawHand(drawingUtils, landmarks, handedness) {
  const colors = { Right: "red", Left: "blue" };
  const color = colors[handedness] || "gray";
  drawingUtils.drawLandmarks(landmarks, { color, radius: 5 });
  drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
    color,
    lineWidth: 2,
  });
}

// Instrument selector (stub for expansion)
function selectInstrument(
  instrument,
  rightStates,
  leftLandmarks,
  synth,
  setKeysPressed,
) {
  if (instrument === "piano") {
    pianoFingerLogic(rightStates, leftLandmarks, synth, setKeysPressed);
  }
}

// --- Main Component: Webcam, MediaPipe Hands, Canvas, 3D Piano & Audio ---

export default function Piano() {
  // React refs and states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationIdRef = useRef(null);
  const pianoRef = useRef(null);
  const [message, setMessage] = useState("Initializing...");
  const [pressedKeys, setPressedKeys] = useState({});
  const instrument = "piano";

  useEffect(() => {
    let isMounted = true;

    async function setup() {
      setMessage("Loading MediaPipe...");
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setMessage("Hand landmarker model loaded.");
          startVideo();
        } else {
          await landmarker.close();
        }
      } catch (err) {
        setMessage(`Initialization error: ${err.message}`);
        console.error(err);
      }
    }

    setup();

    return () => {
      isMounted = false;
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (landmarkerRef.current) {
        landmarkerRef.current.close().catch(console.error);
        landmarkerRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function startVideo() {
    setMessage("Accessing webcam...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setMessage("Webcam started.");

        videoRef.current.width = videoRef.current.videoWidth;
        videoRef.current.height = videoRef.current.videoHeight;
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
        beginProcessing();
      };
    } catch (err) {
      setMessage(`Webcam error: ${err.message}`);
      console.error(err);
    }
  }

  function drawNoteGrid(ctx, width, height, fingerX = null, fingerY = null) {
    const startX = 0;
    const gridWidth = width * 0.7;

    const cols = 4;
    const rows = 3;

    const boxW = gridWidth / cols;
    const boxH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;

        const x = startX + c * boxW;
        const y = r * boxH;

        let active = false;

        if (fingerX !== null && fingerY !== null) {
          const fx = fingerX * width;
          const fy = fingerY * height;

          if (fx > x && fx < x + boxW && fy > y && fy < y + boxH) {
            active = true;
          }
        }

        ctx.fillStyle = active ? "rgba(0,255,255,0.4)" : "rgba(0,0,0,0.25)";

        ctx.fillRect(x, y, boxW, boxH);

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        ctx.fillStyle = "cyan";
        ctx.font = "32px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(gridNotes[index], x + boxW / 2, y + boxH / 2);
      }
    }
  }
  function beginProcessing() {
    const ctx = canvasRef.current?.getContext("2d");
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const drawingUtils = ctx ? new DrawingUtils(ctx) : null;

    async function processFrame() {
      if (
        !video ||
        !landmarker ||
        !canvasRef.current ||
        !canvasRef.current.getContext ||
        video.readyState !== 4
      ) {
        animationIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        animationIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        video,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      // rest of your code here...

      try {
        const results = await landmarker.detectForVideo(
          video,
          performance.now(),
        );

        if (results.landmarks && results.landmarks.length > 0) {
          let leftLandmarks = null;
          let rightStates = [];
          let fingerX = null;
          let fingerY = null;

          results.landmarks.forEach((landmarks, i) => {
            const handedness =
              results.handednesses[i]?.[0]?.categoryName || "Unknown";
            drawHand(drawingUtils, landmarks, handedness);
            if (handedness === "Right") {
              // RIGHT HAND → OCTAVE CONTROL
              rightStates = getFingerStates(landmarks, handedness);
            } else if (handedness === "Left") {
              // LEFT HAND → NOTE PLAYING
              leftLandmarks = landmarks;

              fingerX = landmarks[8].x;
              fingerY = landmarks[8].y;

              drawNoteGrid(
                ctx,
                canvasRef.current.width,
                canvasRef.current.height,
                fingerX,
                fingerY,
              );
            }
          });

          selectInstrument(
            instrument,
            rightStates,
            leftLandmarks,
            pianoRef.current?.synth,
            setPressedKeys,
          );
          setMessage(`Detected ${results.landmarks.length} hand(s).`);
        } else {
          setMessage("No hands detected.");
          setPressedKeys({});
        }
      } catch (err) {
        setMessage("Detection error.");
        console.error(err);
      }

      animationIdRef.current = requestAnimationFrame(processFrame);
    }
    animationIdRef.current = requestAnimationFrame(processFrame);
  }

  useEffect(() => {
    if (pianoRef.current) pianoRef.current.setPressedKeys(pressedKeys);
  }, [pressedKeys]);

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        {/* Background & UI as per original layout */}

        {/* Aurora Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="sky-gradient" />
          <div className="nebula" />
          <div className="laser-container">
            <div className="laser h" />
            <div className="laser h delay-2" />
            <div className="laser v" />
            <div className="laser v delay-3" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-96 perspective-3d" />
          <div className="pedestal-glow" />
          <div id="piano-canvas" className="absolute inset-0" />
          <div className="absolute inset-0 vignette" />
        </div>

        {/* Top Nav Bar */}
        <div className="fixed top-0 left-0 right-50 z-100 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <span className="text-cyan-300 text-md tracking-widest font-bold group-hover:text-cyan-100 transition">
                  《
                </span>
                <div className="text-4xl animate-pulse">Home</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Webcam video (hidden) and canvas overlay */}
        <video ref={videoRef} style={{ display: "none" }} />
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            width: "320px",
            height: "180px",
            border: "2px solid cyan",
            borderRadius: "8px",
            zIndex: 50,
          }}
        />

        {/* Webcam status message */}
        <div
          style={{
            position: "fixed",
            top: 200,
            right: 20,
            color: "cyan",
            fontWeight: "bold",
            textShadow: "0 0 5px black",
            zIndex: 30,
          }}
        >
          {message}
        </div>

        {/* HOLO WEBCAM UI */}

        {/* Main piano stage */}
        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32">
          <div className="text-center z-20 mb-16">
            <h1 className="text-8xl md:text-10xl font-black mb-6"></h1>
            <p className="text-3xl text-cyan-200 font-light tracking-widest">
              Wave Your Hand to Play.
            </p>
          </div>

          {/* Piano 3D Canvas */}
          <div
            id="virtual-piano-container"
            className="relative w-full max-w-5xl h-96 bg-cyan/40 backdrop-blur-2xl
            border-4 border-cyan-400/60 rounded-3xl shadow-2xl shadow-cyan-500/80
            overflow-hidden flex items-center justify-center animate-pulse-slow"
          >
            <PianoK ref={pianoRef} />
          </div>

          {/* Hand detection guide */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl z-20">
            {[
              { gesture: "Open Hand", action: "Play White Keys", icon: "🖐️" },
              { gesture: "Pinch", action: "Play Black Keys", icon: "🤏" },
              { gesture: "Swipe Up", action: "Higher Octave", icon: "🫱🏻‍🫲🏻" },
            ].map((g, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="text-8xl group-hover:animate-bounce transition-all">
                    {g.icon}
                  </div>
                  <div
                    className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-100 
                    bg-gradient-to-br from-cyan-400 to-purple-400 scale-150 transition-opacity"
                  />
                </div>
                <p className="text-xl font-black text-cyan-300">{g.gesture}</p>
                <p className="text-gray-400 text-sm mt-1">→ {g.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative py-12 text-center border-t border-white/10 z-20">
          <p className="text-gray-500 text-sm">
            <span className="text-cyan-300">HandSonicCanvas</span> • Piano
            Engine v2.0
          </p>
        </footer>

        {/* Sparkles */}
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="sparkle fixed pointer-events-none"
            style={{
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background: linear-gradient(to right, #14b8a6, #06b6d4, #10b981);
          background-size: 300%;
          animation: gradient 14s ease infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(200%);
          }
        }
        .animate-scan {
          animation: scan 5s linear infinite;
        }

        .mist {
          position: fixed;
          inset: 0;
          background: radial-gradient(
            circle at 50% 30%,
            rgba(20, 184, 166, 0.15) 0%,
            transparent 70%
          );
          filter: blur(60px);
          animation: mistFlow 20s ease-in-out infinite;
        }
        @keyframes mistFlow {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }

        .leaf {
          width: 30px;
          height: 40px;
          background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50,10 Q90,50 50,90 Q10,50 50,10' fill='%2314b8a6'/></svg>");
          background-size: contain;
          animation: leafFall 12s linear infinite;
          opacity: 0.3;
        }
        @keyframes leafFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .flute-floor {
          background: repeating-linear-gradient(
            135deg,
            #001a1a 0px,
            #001a1a 15px,
            #002020 15px,
            #002020 30px
          );
          animation: ledPulse 6s infinite;
        }
        .flute-glow {
          background: radial-gradient(
            circle,
            rgba(20, 184, 166, 0.4) 0%,
            transparent 70%
          );
          filter: blur(140px);
          animation: glowPulse 4s ease-in-out infinite;
        }

        /* Core shared styles */

        .sky-gradient {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 10%, #001a1a 0%, #000 80%);
        }
        .nebula {
          opacity: 0.6;
        }
        .laser {
          background: linear-gradient(90deg, transparent, #14b8a6, transparent);
          box-shadow: 0 0 40px #06b6d4;
        }
        .laser.h {
          height: 1.5px;
          top: 30%;
          animation: sweepH 12s linear infinite;
        }
        .laser.v {
          width: 1.5px;
          animation: sweepV 14s linear infinite;
        }
        @keyframes sweepH {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(120%);
          }
        }
        @keyframes sweepV {
          from {
            transform: translateY(-120%);
          }
          to {
            transform: translateY(120%);
          }
        }
        @keyframes ledPulse {
          0%,
          100% {
            box-shadow: 0 0 30px #14b8a6;
          }
          50% {
            box-shadow: 0 0 70px #06b6d4;
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }
        .vignette {
          background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.9) 100%
          );
        }
        .sparkle {
          background: #06b6d4;
          box-shadow: 0 0 30px #14b8a6;
          animation: sparkle 12s linear infinite;
        }
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translateY(100vh) scale(0);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1);
          }
        }
      `}</style>
    </>
  );
}
