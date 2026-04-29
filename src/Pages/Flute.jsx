/* src/pages/Flute.jsx */
import React, { useRef, useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as Tone from "tone";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import FluteK from "../models/Flute.jsx"; // ← your existing 3D component

// ────────────────────────────────────────────────
//  Utility & Hand gesture logic  (same as Drums)
// ────────────────────────────────────────────────
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isThumbOpen(landmarks, handedness) {
  if (!landmarks) return null;
  const tip = landmarks[4];
  const ip = landmarks[3];
  const mcp = landmarks[2];
  if (handedness === "Right") return tip.x < ip.x && tip.x < mcp.x;
  else return tip.x > ip.x && tip.x > mcp.x;
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
    isThumbOpen(landmarks, handedness) ? "Open" : "Closed",
    isFingerOpen(landmarks, 8, 6) ? "Open" : "Closed",
    isFingerOpen(landmarks, 12, 10) ? "Open" : "Closed",
    isFingerOpen(landmarks, 16, 14) ? "Open" : "Closed",
    isFingerOpen(landmarks, 20, 18) ? "Open" : "Closed",
  ];
}

function drawHand(drawingUtils, landmarks, handedness) {
  const colors = { Right: "red", Left: "blue" };
  const color = colors[handedness] || "gray";
  drawingUtils.drawLandmarks(landmarks, { color, radius: 5 });
  drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
    color,
    lineWidth: 2,
  });
}

// ────────────────────────────────────────────────
//   Flute note mapping  (your provided scheme)
// ────────────────────────────────────────────────
const fluteNotes = {
  "Closed Closed Closed Closed Closed": "Sa",
  "Open Closed Closed Closed Closed": "Re",
  "Open Open Closed Closed Closed": "Ga",
  "Open Open Open Closed Closed": "Ma",
  "Open Open Open Open Closed": "Pa",
  "Open Open Open Open Open": "Dha",
};

const noteFrequencies = {
  Sa: "C4",
  Re: "D4",
  Ga: "E4",
  Ma: "F4",
  Pa: "G4",
  Dha: "A4",
  Ni: "B4",
  SaHi: "C5",
};

function playFluteTone(synth, noteName) {
  if (!noteName || !noteFrequencies[noteName]) return;
  synth.triggerAttackRelease(noteFrequencies[noteName], "8n");
}

// ────────────────────────────────────────────────
//  3D Flute Model + Animation when holes covered
// ────────────────────────────────────────────────
const holeNames = ["hole1", "hole2", "hole3", "hole4", "hole5"]; // ← adjust to match your FluteK model names
const pressOffset = -0.008; // small movement

function FluteModel({ url, coveredHoles }) {
  const { scene } = useGLTF(url || "/flute.glb"); // fallback — use your real path if different
  const synth = useRef(null);
  const lastNote = useRef(null);

  useEffect(() => {
    if (synth.current) return;

    const fluteSynth = new Tone.MonoSynth({
      oscillator: {
        type: "sine",
      },

      envelope: {
        attack: 0.25,
        decay: 0.15,
        sustain: 0.9,
        release: 2.5,
      },

      filter: {
        Q: 1,
        type: "lowpass",
        rolloff: -24,
      },

      filterEnvelope: {
        attack: 0.2,
        decay: 0.1,
        sustain: 0.8,
        release: 2,
        baseFrequency: 600,
        octaves: 2,
      },
    });

    const filter = new Tone.Filter(1200, "lowpass");

    const reverb = new Tone.Reverb({
      decay: 6,
      wet: 0.5,
    });

    const vibrato = new Tone.Vibrato({
      frequency: 5,
      depth: 0.15,
    });

    fluteSynth.chain(vibrato, filter, reverb, Tone.Destination);

    synth.current = fluteSynth;
  }, []);

  useEffect(() => {
    if (!coveredHoles || !synth.current) return;

    const { thumb, hole1, hole2, hole3, hole4, hole5, hole6, hole7 } =
      coveredHoles;

    // 🚫 Do nothing if thumb open
    if (!thumb) {
      lastNote.current = null;
      return;
    }

    let currentNote = null;

    if (hole1 && !hole2) currentNote = "Sa";
    else if (hole1 && hole2 && !hole3) currentNote = "Re";
    else if (hole1 && hole2 && hole3 && !hole4) currentNote = "Ga";
    else if (hole1 && hole2 && hole3 && hole4 && !hole5) currentNote = "Ma";
    else if (hole1 && hole2 && hole3 && hole4 && hole5 && !hole6)
      currentNote = "Pa";
    else if (hole1 && hole2 && hole3 && hole4 && hole5 && hole6 && !hole7)
      currentNote = "Dha";
    else if (hole1 && hole2 && hole3 && hole4 && hole5 && hole6 && hole7)
      currentNote = "Ni";

    if (currentNote && lastNote.current !== currentNote) {
      lastNote.current = currentNote;

      Tone.start().then(() => {
        synth.current.triggerAttackRelease(noteFrequencies[currentNote], "8n");
      });
    }
  }, [coveredHoles]);

  // Reset positions once on load
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && holeNames.includes(child.name)) {
        if (!child.userData.originalY) {
          child.userData.originalY = child.position.y;
        }
      }
    });
  }, [scene]);

  // Animate holes when covered + play note
  useEffect(() => {
    if (!coveredHoles) return;
    if (!coveredHoles.thumb) {
      lastNote.current = null;
      return;
    }

    let currentNote = null;
    const states = Object.values(coveredHoles);

    const key = states.map((s) => (s ? "Closed" : "Open")).join(" ");

    if (fluteNotes[key]) {
      currentNote = fluteNotes[key];
    } else if (states.filter(Boolean).length === 0) {
      currentNote = "Sa"; // all open = Sa (common convention)
    }

    // Visual feedback: move "covered" holes down
    scene.traverse((child) => {
      if (child.isMesh && holeNames.includes(child.name)) {
        const index = holeNames.indexOf(child.name);
        const shouldCover = !!coveredHoles[`finger${index + 1}`];
        child.position.y = shouldCover
          ? child.userData.originalY + pressOffset
          : child.userData.originalY;
      }
    });

    if (currentNote && lastNote.current !== currentNote) {
      lastNote.current = currentNote;
      Tone.start().then(() => playFluteTone(synth.current, currentNote));
    }
  }, [coveredHoles, scene]);

  return <primitive object={scene} castShadow receiveShadow />;
}

// ────────────────────────────────────────────────
//  Hand → Flute finger mapping controller
// ────────────────────────────────────────────────
function getFluteCoveredHoles(left, right) {
  if (!right) return {};

  const [rThumb, rIndex, rMiddle, rRing, rPinky] = right || [];
  const [, lIndex, lMiddle, lRing] = left || [];

  return {
    thumb: rThumb === "Closed",

    hole1: lIndex === "Closed",
    hole2: lMiddle === "Closed",
    hole3: lRing === "Closed",

    hole4: rIndex === "Closed",
    hole5: rMiddle === "Closed",
    hole6: rRing === "Closed",
    hole7: rPinky === "Closed",
  };
}

function HandFluteController({ setCoveredHoles, videoRef, canvasRef }) {
  const landmarkerRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
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
          await startVideo();
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      isMounted = false;
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (landmarkerRef.current)
        landmarkerRef.current.close().catch(console.error);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [videoRef]);

  async function startVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 256, height: 168, frameRate: 30 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          videoRef.current.width = videoRef.current.videoWidth;
          videoRef.current.height = videoRef.current.videoHeight;
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          beginProcessing();
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  function beginProcessing() {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const drawingUtils = new DrawingUtils(ctx);

    function processFrame() {
      if (!video || !landmarker || video.readyState !== 4) {
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

      let left = null,
        right = null;

      try {
        const results = landmarker.detectForVideo(video, performance.now());

        if (results?.landmarks?.length > 0) {
          results.landmarks.forEach((landmarks, i) => {
            const handedness =
              results.handednesses?.[i]?.[0]?.categoryName || "Unknown";
            drawHand(drawingUtils, landmarks, handedness);

            if (handedness === "Left") {
              left = getFingerStates(landmarks, handedness);
            } else if (handedness === "Right") {
              right = getFingerStates(landmarks, handedness);
            }
          });

          setCoveredHoles(getFluteCoveredHoles(left, right)); // or setDrumTriggers(...)
        } else {
          setCoveredHoles({}); // or setDrumTriggers({})
        }
      } catch (e) {
        console.error("Detection error:", e);
      }

      animationIdRef.current = requestAnimationFrame(processFrame);
    }

    animationIdRef.current = requestAnimationFrame(processFrame);
  }

  return null;
}

// ────────────────────────────────────────────────
//  Webcam overlay (your original styling preserved)
// ────────────────────────────────────────────────
function WebcamOverlay({ videoRef, canvasRef }) {
  return (
    <div
      className="fixed top-6 right-6 z-50 pointer-events-none"
      style={{ width: 216, height: 168 }}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 blur-xl animate-pulse opacity-70" />
        <div className="relative w-full h-full rounded-2xl bg-black/80 backdrop-blur-3xl border-4 border-teal-400/80 shadow-2xl shadow-teal-500/90 overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 1,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 2,
            }}
          />
          {/* your decorations */}
          <div className="absolute top-0 left-0 w-12 h-px bg-teal-400 shadow-lg shadow-teal-400" />
          <div className="absolute top-0 left-0 h-12 w-px bg-teal-400 shadow-lg shadow-teal-400" />
          <div className="absolute bottom-0 right-0 w-12 h-px bg-cyan-400 shadow-lg shadow-cyan-400" />
          <div className="absolute bottom-0 right-0 h-12 w-px bg-cyan-400 shadow-lg shadow-cyan-400" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-cyan-400 rounded-full" />
          <div className="absolute bottom-3 left-3 text-teal-300 text-xs font-bold tracking-widest">
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────
export default function Flute() {
  const [coveredHoles, setCoveredHoles] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => (document.body.style.overflowX = "auto");
  }, []);

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        {/* Background effects – your original */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="sky-gradient" />
          <div className="nebula" />
          <div className="mist" />
          <div className="laser-container">
            <div className="laser h" />
            <div className="laser h delay-2" />
            <div className="laser v" />
            <div className="laser v delay-3" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-96 perspective-3d">
            <div className="led-floor flute-floor" />
          </div>
          <div className="pedestal-glow flute-glow" />
          <div ref={overlayRef} className="absolute inset-0 vignette" />
        </div>

        {/* Top nav – your original */}
        <div className="fixed top-0 left-0 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <span className="text-teal-400 text-3xl font-black group-hover:text-teal-300 transition">
                  《
                </span>
                <div className="text-5xl font-black animate-pulse text-teal-300 drop-shadow-2xl shadow-teal-500/80">
                  Home
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Hand tracking */}
        <HandFluteController
          setCoveredHoles={setCoveredHoles}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
        <WebcamOverlay videoRef={videoRef} canvasRef={canvasRef} />

        {/* Main content – your original layout */}
        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32">
          <div className="text-center z-20 mb-16">
            <p className="text-3xl text-teal-200 font-light tracking-widest">
              Wave Your Hand to Play.
            </p>
          </div>

          <div className="relative w-full max-w-5xl h-96 bg-black/40 backdrop-blur-2xl border-4 border-teal-400/60 rounded-3xl shadow-2xl shadow-teal-500/80 overflow-hidden animate-pulse-slow">
            <Canvas
              style={{ width: "100%", height: "100%" }}
              camera={{ position: [0, 4, 18], fov: 50 }}
              shadows
            >
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[8, 12, 10]}
                intensity={1}
                castShadow
              />
              <Suspense fallback={null}>
                <FluteModel coveredHoles={coveredHoles} />
                <OrbitControls enableZoom={true} enablePan={false} />
              </Suspense>
            </Canvas>
          </div>

          {/* Gesture guide – your original (you can update text later) */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl z-20">
            {[
              { gesture: "Blow Soft", action: "Low Note", icon: "🌬️" },
              { gesture: "Cover Holes", action: "Change Note", icon: "✋" },
              { gesture: "Tilt Hand", action: "Vibrato", icon: "👋" },
            ].map((g, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="text-8xl group-hover:animate-bounce transition-all">
                    {g.icon}
                  </div>
                  <div className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-teal-400 to-cyan-400 scale-150 transition-opacity" />
                </div>
                <p className="text-xl font-black text-teal-300">{g.gesture}</p>
                <p className="text-gray-400 text-sm mt-1">→ {g.action}</p>
              </div>
            ))}
          </div>

          {/* Leaves + footer + sparkles – unchanged */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="leaf fixed pointer-events-none opacity-30"
              style={{ left: `${10 + i * 7}%`, animationDelay: `${i * 0.8}s` }}
            />
          ))}

          <footer className="relative py-12 text-center border-t border-white/10 z-20">
            <p className="text-gray-500 text-sm">
              <span className="text-teal-300">HandSonicCanvas</span> • Flute
              Engine v1.0
            </p>
          </footer>

          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="sparkle fixed pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* --------------------------------------------------- CSS --------------------------------------------------- */}
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
