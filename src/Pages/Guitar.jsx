// src/pages/Guitar.jsx
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

// ─── Synth & Effects (global) ────────────────────────────────────────
const guitarSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.005,
    decay: 0.18,
    sustain: 0.3,
    release: 0.6,
  },
}).toDestination();

const distortion = new Tone.Distortion(0.35);
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 });
guitarSynth.connect(distortion);
distortion.connect(reverb);

const chords = [
  { notes: ["E2", "B2", "E3", "G#3", "B3", "E4"] }, // 0 open
  { notes: ["F2", "C3", "F3", "A3", "C4", "F4"] }, // 1
  { notes: ["G2", "D3", "G3", "B3", "D4", "G4"] }, // 2
  { notes: ["A2", "E3", "A3", "C4", "E4", "A4"] }, // 3
  { notes: ["C3", "G3", "C4", "E4", "G4", "C5"] }, // 4
  { notes: ["D3", "A3", "D4", "F4", "A4", "D5"] }, // 5
];

// ─── Helpers (unchanged) ─────────────────────────────────────────────
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function getLeftFret(lm) {
  const thumbClosed = lm[4].x < lm[3].x;
  const indexClosed = lm[8].y > lm[6].y;
  const middleClosed = lm[12].y > lm[10].y;
  const ringClosed = lm[16].y > lm[14].y;
  const littleClosed = lm[20].y > lm[18].y;

  if (
    thumbClosed &&
    !indexClosed &&
    !middleClosed &&
    !ringClosed &&
    !littleClosed
  )
    return 1;
  if (
    indexClosed &&
    !thumbClosed &&
    !middleClosed &&
    !ringClosed &&
    !littleClosed
  )
    return 2;
  if (
    middleClosed &&
    !thumbClosed &&
    !indexClosed &&
    !ringClosed &&
    !littleClosed
  )
    return 3;
  if (
    ringClosed &&
    !thumbClosed &&
    !indexClosed &&
    !middleClosed &&
    !littleClosed
  )
    return 4;
  if (
    littleClosed &&
    !thumbClosed &&
    !indexClosed &&
    !middleClosed &&
    !ringClosed
  )
    return 5;

  return 0; // all open
}

function isFingerClosed(landmarks, tipIdx, pipIdx) {
  if (!landmarks) return false;
  return (
    dist(landmarks[tipIdx], landmarks[0]) <
    dist(landmarks[pipIdx], landmarks[0])
  );
}

function getRightString(lm) {
  const thumbClosed = lm[4].x < lm[3].x;
  const indexClosed = lm[8].y > lm[6].y;
  const middleClosed = lm[12].y > lm[10].y;
  const ringClosed = lm[16].y > lm[14].y;
  const littleClosed = lm[20].y > lm[18].y;

  const thumbOpen = !thumbClosed;
  const indexOpen = !indexClosed;
  const middleOpen = !middleClosed;
  const ringOpen = !ringClosed;
  const littleOpen = !littleClosed;

  // ALL CLOSED → STRING 6
  if (thumbClosed && indexClosed && middleClosed && ringClosed && littleClosed)
    return 6;

  // ONLY THUMB + LITTLE OPEN → STRUM
  if (thumbOpen && littleOpen && indexClosed && middleClosed && ringClosed)
    return "STRUM";

  // SINGLE FINGER STRINGS
  if (thumbClosed && indexOpen && middleOpen && ringOpen && littleOpen)
    return 1;
  if (indexClosed && thumbOpen && middleOpen && ringOpen && littleOpen)
    return 2;
  if (middleClosed && thumbOpen && indexOpen && ringOpen && littleOpen)
    return 3;
  if (ringClosed && thumbOpen && indexOpen && middleOpen && littleOpen)
    return 4;
  if (littleClosed && thumbOpen && indexOpen && middleOpen && ringOpen)
    return 5;

  return null;
}

function drawHand(drawingUtils, landmarks, handedness) {
  const color = handedness === "Right" ? "#ff4444" : "#4488ff";
  drawingUtils.drawLandmarks(landmarks, { color, radius: 5 });
  drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
    color,
    lineWidth: 2.5,
  });
}

// ─── 3D Model ────────────────────────────────────────────────────────
function GuitarModel({ url, strumTrigger }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!strumTrigger) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        const orig = child.userData.origPos || child.position.clone();
        child.userData.origPos = orig;
        child.position.x += (Math.random() - 0.5) * 0.07;
        child.position.y += (Math.random() - 0.5) * 0.05;
        setTimeout(() => child.position.copy(orig), 140);
      }
    });
  }, [strumTrigger, scene]);

  return <primitive object={scene} castShadow receiveShadow />;
}

// ─── Hand Controller ─────────────────────────────────────────────────
function HandGuitarController({
  audioEnabled,
  setStrumTrigger,
  setChordIndex, // ← added this prop
  videoRef,
  canvasRef,
}) {
  const landmarkerRef = useRef(null);
  const frameRef = useRef(null);
  const prevIndexY = useRef(null);
  const lastStrumTime = useRef(0);

  useEffect(() => {
    let mounted = true;

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
        if (mounted) {
          landmarkerRef.current = landmarker;
          await startVideo();
        }
      } catch (err) {
        console.error("Landmarker failed:", err);
      }
    })();

    return () => {
      mounted = false;
      cancelAnimationFrame(frameRef.current);
      landmarkerRef.current?.close().catch(() => {});
      videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 256, height: 168, frameRate: 30 },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        videoRef.current.width = videoRef.current.videoWidth;
        videoRef.current.height = videoRef.current.videoHeight;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        beginProcessing();
      };
    } catch (err) {
      console.error("Camera error:", err);
    }
  }

  function beginProcessing() {
    const ctx = canvasRef.current?.getContext("2d");
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!ctx || !video || !landmarker) return;

    const drawUtils = new DrawingUtils(ctx);

    async function process() {
      if (video.readyState < 4) {
        frameRef.current = requestAnimationFrame(process);
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

      let leftRaised = 0;
      let rightStrumType = "none";
      let rightIndexY = null;
      let handsDetected = false;

      try {
        const results = await landmarker.detectForVideo(
          video,
          performance.now(),
        );
        if (results.landmarks?.length > 0) {
          handsDetected = true;
          results.landmarks.forEach((lm, i) => {
            const hand =
              results.handednesses?.[i]?.[0]?.categoryName || "Unknown";
            drawHand(drawUtils, lm, hand);
            if (hand === "Left") {
              const fret = getLeftFret(lm);

              setChordIndex(fret);
            }
            if (hand === "Right") {
              rightStrumType = getRightString(lm);
              rightIndexY = lm[8]?.y ?? null;
            }
          });

          // This line was crashing because setChordIndex wasn't passed
          // setChordIndex(handsDetected ? Math.min(leftRaised, 4) : 0);

          if (
            audioEnabled &&
            rightIndexY !== null &&
            prevIndexY.current !== null &&
            rightStrumType !== null
          ) {
            const delta = prevIndexY.current - rightIndexY;
            const now = Date.now();

            if (delta > 0.06 && now - lastStrumTime.current > 180) {
              setStrumTrigger({ time: now, string: rightStrumType });
              lastStrumTime.current = now;
            }
          }

          if (rightIndexY !== null) prevIndexY.current = rightIndexY;
        } else {
          setChordIndex(0);
          prevIndexY.current = null;
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      frameRef.current = requestAnimationFrame(process);
    }

    frameRef.current = requestAnimationFrame(process);
  }

  return null;
}

// ─── Webcam Overlay (unchanged) ─────────────────────────────────────
function WebcamOverlay({ videoRef, canvasRef }) {
  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <div className="relative w-[216px] h-[168px]">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-500 to-cyan-500 blur-xl animate-pulse opacity-70" />
        <div className="relative w-full h-full rounded-2xl bg-black/80 backdrop-blur-3xl border-4 border-purple-400/80 shadow-2xl shadow-purple-500/90 overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              zIndex: 1,
              filter: "brightness(0.9) contrast(1.2)",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          <div className="absolute top-0 left-0 w-12 h-px bg-purple-400 shadow-lg shadow-purple-400" />
          <div className="absolute top-0 left-0 h-12 w-px bg-purple-400 shadow-lg shadow-purple-400" />
          <div className="absolute bottom-0 right-0 w-12 h-px bg-pink-400 shadow-lg shadow-pink-400" />
          <div className="absolute bottom-0 right-0 h-12 w-px bg-pink-400 shadow-lg shadow-pink-400" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-pink-500 rounded-full animate-ping" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-pink-400 rounded-full" />
          <div className="absolute bottom-3 left-3 text-purple-300 text-xs font-bold tracking-widest">
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function Guitar() {
  // const [audioEnabled, setAudioEnabled] = useState(true);
  const [strumTrigger, setStrumTrigger] = useState({ time: 0, string: null });
  const [chordIndex, setChordIndex] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const unlock = async () => {
      await Tone.start();
      setAudioEnabled(true);
      window.removeEventListener("pointerdown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  // Sound trigger
  useEffect(() => {
    if (!audioEnabled) return;
    if (!strumTrigger.time) return;

    const baseChord = chords[chordIndex] || chords[0];
    const stringType = strumTrigger.string;

    // STRUM ALL STRINGS
    if (stringType === "STRUM") {
      guitarSynth.triggerAttackRelease(baseChord.notes, "8n");
      return;
    }

    // SINGLE STRING
    if (typeof stringType === "number") {
      const note = baseChord.notes[stringType - 1];
      if (note) {
        guitarSynth.triggerAttackRelease(note, "8n");
      }
    }
  }, [strumTrigger, chordIndex, audioEnabled]);

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        {/* background layers unchanged */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="sky-gradient" />
          <div className="nebula" />
          <div className="laser-container">
            <div className="laser h" />
            <div className="laser h delay-2" />
            <div className="laser v" />
            <div className="laser v delay-3" />
          </div>
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute bottom-0 left-0 right-0 h-96 perspective-3d">
            <div className="led-floor guitar-floor" />
          </div>
          <div className="pedestal-glow guitar-glow" />
          <div id="guitar-canvas" className="absolute inset-0" />
          <div className="absolute inset-0 vignette" />
        </div>

        {/* top nav unchanged */}
        <div className="fixed top-0 left-0 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-3xl font-black group-hover:text-purple-300 transition">
                  《
                </span>
                <div className="text-5xl font-black animate-pulse text-purple-300 drop-shadow-2xl shadow-purple-500/80">
                  Home
                </div>
              </div>
            </Link>
          </div>
        </div>

        <WebcamOverlay videoRef={videoRef} canvasRef={canvasRef} />

        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32">
          <div className="text-center z-20 mb-16">
            <p className="text-3xl text-purple-200 font-light tracking-widest">
              Wave Your Hand to Play.
            </p>
          </div>

          <div className="relative w-full max-w-5xl h-96 bg-black/35 backdrop-blur-xl border-4 border-purple-400/50 rounded-3xl shadow-2xl shadow-purple-600/70 overflow-hidden flex items-center justify-center animate-pulse-slow">
            <div className="w-full h-full">
              <Canvas
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                }}
                camera={{ position: [0, 4, 18], fov: 55 }}
                shadows
              >
                <ambientLight intensity={0.6} />
                <directionalLight
                  position={[10, 14, 12]}
                  intensity={1.1}
                  castShadow
                />
                <Suspense fallback={null}>
                  <GuitarModel
                    url="/guitar.glb"
                    strumTrigger={strumTrigger.time}
                  />
                  <OrbitControls enableZoom={true} enablePan={false} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl z-20">
            {[
              {
                gesture: "Strum Down",
                action: "Power Chord",
                icon: "Down Hand",
              },
              {
                gesture: "Pinch Strings",
                action: "Bend Note",
                icon: "Pinching Hand",
              },
              { gesture: "Palm Mute", action: "Crunch", icon: "Closed Fist" },
            ].map((g, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="text-8xl group-hover:animate-bounce transition-all">
                    {g.icon}
                  </div>
                  <div className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-400 to-pink-400 scale-150 transition-opacity" />
                </div>
                <p className="text-xl font-black text-purple-300">
                  {g.gesture}
                </p>
                <p className="text-gray-400 text-sm mt-1">→ {g.action}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative py-12 text-center border-t border-white/10 z-20">
          <p className="text-gray-500 text-sm">
            <span className="text-purple-300">HandSonicCanvas</span> • Guitar
            Engine v2.0
          </p>
        </footer>

        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            className="sparkle fixed pointer-events-none"
            style={{
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 7}s`,
            }}
          />
        ))}
      </div>

      {/* FIXED: pass setChordIndex prop here */}
      <HandGuitarController
        audioEnabled={audioEnabled} // ✅ ADD THIS
        setStrumTrigger={setStrumTrigger}
        setChordIndex={setChordIndex}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />

      <style jsx>{`
        /* your full style block here – unchanged */
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
          background: linear-gradient(to right, #a855f7, #ec4899, #06b6d4);
          background-size: 300%;
          animation: gradient 9s ease infinite;
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
          animation: pulse-slow 3s ease-in-out infinite;
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
          animation: scan 2.5s linear infinite;
        }
        .grid-bg {
          background-image:
            linear-gradient(0deg, #333 1px, transparent 1px),
            linear-gradient(90deg, #333 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.15;
          animation: gridMove 30s linear infinite;
        }
        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 40px 40px;
          }
        }
        .guitar-floor {
          background: repeating-linear-gradient(
            45deg,
            #111 0px,
            #111 20px,
            #222 20px,
            #222 40px
          );
          animation: ledPulse 3s infinite;
        }
        .guitar-glow {
          background: radial-gradient(
            circle,
            rgba(170, 50, 255, 0.5) 0%,
            transparent 70%
          );
          filter: blur(120px);
          animation: glowPulse 2s ease-in-out infinite;
        }
        .sky-gradient {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 10%, #1a0033 0%, #000 80%);
        }
        .nebula {
          position: fixed;
          inset: 0;
          background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><filter id='n'><feTurbulence baseFrequency='0.025' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 0 0.7 0 0 0 0.8 0'/></filter><rect width='800' height='800' filter='url(%23n)' opacity='0.5'/></svg>");
          background-size: 220%;
          animation: nebula 100s linear infinite;
        }
        @keyframes nebula {
          to {
            background-position: 100% 100%;
          }
        }
        .laser {
          position: fixed;
          background: linear-gradient(90deg, transparent, #cc00ff, transparent);
          box-shadow: 0 0 50px #ff00ff;
        }
        .laser.h {
          height: 3px;
          top: 25%;
          animation: sweepH 7s linear infinite;
        }
        .laser.v {
          width: 3px;
          left: 50%;
          animation: sweepV 9s linear infinite;
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
            box-shadow: 0 0 50px #aa32ff;
          }
          50% {
            box-shadow: 0 0 90px #ff00aa;
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .vignette {
          position: fixed;
          inset: 0;
          background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.95) 100%
          );
        }
        .sparkle {
          width: 6px;
          height: 6px;
          background: #ff00ff;
          box-shadow: 0 0 30px #aa00ff;
          animation: sparkle 7s linear infinite;
          border-radius: 50%;
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
            transform: translateY(-100px) scale(1.8);
          }
        }
      `}</style>
    </>
  );
}
