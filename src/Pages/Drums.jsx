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

// Utility distance function
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

// Hand gestures logic
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
    isThumbOpen(landmarks, handedness) ? "open" : "closed",
    isFingerOpen(landmarks, 8, 6) ? "open" : "closed", // index finger
    isFingerOpen(landmarks, 12, 10) ? "open" : "closed", // middle finger
    isFingerOpen(landmarks, 16, 14) ? "open" : "closed", // ring finger
    isFingerOpen(landmarks, 20, 18) ? "open" : "closed", // pinky
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

// 3D Drum Model with Tone.js Sounds
const nameMap = {
  Object_70: "bass",
  Object_9: "tomFloor",
  Object_56: "snare",
  Object_104: "tomMid",
  Object_95: "tomHigh",
  Object_16: "cymbalRide",
  Object_27: "cymbalCrash",
  Object_38: "cymbalHiHat",
  Object_88: "cymbalRide",
};

const interactiveParts = new Set(Object.values(nameMap));
const pressOffset = -0.1;

function playDrumTone(synths, drumName) {
  switch (drumName) {
    case "bass":
      synths.kick.triggerAttackRelease("C2", "8n");
      break;
    case "snare":
      synths.snare.triggerAttackRelease("16n");
      break;
    case "tomFloor":
      synths.tom.triggerAttackRelease("G2", "8n");
      break;
    case "tomMid":
      synths.tom.triggerAttackRelease("A2", "8n");
      break;
    case "tomHigh":
      synths.tom.triggerAttackRelease("B2", "8n");
      break;
    case "cymbalHiHat":
      synths.hihat.triggerAttackRelease("16n");
      break;
    case "cymbalRide":
    case "cymbalCrash":
      synths.cymbal.triggerAttackRelease("C4", "4n");
      break;
    default:
      break;
  }
}

function DrumsModel({ url, pressed }) {
  const { scene } = useGLTF(url);
  const synths = React.useRef({});

  React.useEffect(() => {
    if (!synths.current.kick) {
      synths.current.kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 8,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
        oscillator: { type: "sine" },
      }).toDestination();

      synths.current.snare = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
        volume: -5,
      }).toDestination();

      synths.current.hihat = new Tone.MetalSynth({
        frequency: 6000,
        envelope: { attack: 0.001, decay: 0.1, release: 0.02 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -12,
      }).toDestination();

      synths.current.tom = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 7,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.8 },
      }).toDestination();

      synths.current.cymbal = new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 1.2, release: 0.6 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 8000,
        octaves: 1.5,
        volume: -15,
      }).toDestination();
    }
  }, []);

  React.useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.userData.originalY === undefined) {
        child.userData.originalY = child.position.y;
      }
    });
  }, [scene]);

  React.useEffect(() => {
    if (!pressed) return;
    Object.entries(pressed).forEach(([drum, hit]) => {
      if (!hit) return;
      scene.traverse((child) => {
        if (
          child.isMesh &&
          interactiveParts.has(nameMap[child.name]) &&
          nameMap[child.name] === drum
        ) {
          child.position.y = child.userData.originalY + pressOffset;
          setTimeout(() => {
            child.position.y = child.userData.originalY;
          }, 100);
        }
      });
      Tone.start().then(() => playDrumTone(synths.current, drum));
    });
  }, [pressed, scene]);

  function onPointerDown(e) {
    const meshName = e.object.name;
    const drumName = nameMap[meshName];
    if (drumName && interactiveParts.has(drumName)) {
      e.stopPropagation();
      e.object.position.y = e.object.userData.originalY + pressOffset;
      Tone.start().then(() => playDrumTone(synths.current, drumName));
    }
  }

  function onPointerUp(e) {
    const meshName = e.object.name;
    const drumName = nameMap[meshName];
    if (drumName && interactiveParts.has(drumName)) {
      e.stopPropagation();
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

function getDrumTriggers(left, right) {
  return {
    bass: left && left[0] === "closed",
    crash: left && left[1] === "closed",
    tomHigh: left && left[2] === "closed",
    tomFloor: left && left[3] === "closed",
    snare: right && right[0] === "closed",
    cymbalHiHat: right && right[1] === "closed",
    cymbalRide: right && right[2] === "closed",
    tomMid: right && right[3] === "closed",
  };
}

function HandDrumController({ setDrumTriggers, videoRef, canvasRef }) {
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
        } else {
          await landmarker.close();
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
      if (!videoRef.current) return;
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

    async function processFrame() {
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
        const results = await landmarker.detectForVideo(
          video,
          performance.now(),
        );
        if (results.landmarks && results.landmarks.length > 0) {
          results.landmarks.forEach((landmarks, i) => {
            const handedness =
              results.handednesses[i]?.[0]?.categoryName || "Unknown";
            drawHand(drawingUtils, landmarks, handedness);
            if (handedness === "Left")
              left = getFingerStates(landmarks, handedness);
            else if (handedness === "Right")
              right = getFingerStates(landmarks, handedness);
          });
          setDrumTriggers(getDrumTriggers(left, right));
        } else {
          setDrumTriggers({});
        }
      } catch (e) {
        console.error(e);
      }

      animationIdRef.current = requestAnimationFrame(processFrame);
    }
    animationIdRef.current = requestAnimationFrame(processFrame);
  }

  return null;
}

function WebcamOverlay({ videoRef, canvasRef }) {
  return (
    <div
      className="fixed top-6 right-6 z-50 pointer-events-none"
      style={{ width: 216, height: 168 }}
    >
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 blur-xl animate-pulse opacity-70"
          style={{ borderRadius: "1rem" }}
        />
        <div
          className="relative w-full h-full rounded-2xl bg-black/80 backdrop-blur-3xl border-4 border-orange-400/80 shadow-2xl shadow-orange-500/90 overflow-hidden flex items-center justify-center"
          style={{ borderRadius: "1rem" }}
        >
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
              filter: "brightness(0.9) contrast(1.2)",
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
          <div className="absolute top-0 left-0 w-12 h-px bg-orange-400 shadow-lg shadow-orange-400" />
          <div className="absolute top-0 left-0 h-12 w-px bg-orange-400 shadow-lg shadow-orange-400" />
          <div className="absolute bottom-0 right-0 w-12 h-px bg-red-400 shadow-lg shadow-red-400" />
          <div className="absolute bottom-0 right-0 h-12 w-px bg-red-400 shadow-lg shadow-red-400" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-scan" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-red-400 rounded-full" />
          <div className="absolute bottom-3 left-3 text-orange-300 text-xs font-bold tracking-widest">
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Drums() {
  const overlay = useRef();
  const [drumTriggers, setDrumTriggers] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="sky-gradient" />
          <div className="nebula" />
          <div className="laser-container">
            <div className="laser h" />
            <div className="laser h delay-2" />
            <div className="laser v" />
            <div className="laser v delay-3" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-96 perspective-3d">
            <div className="led-floor drum-floor" />
          </div>
          <div className="pedestal-glow drum-glow" />
          <div id="drums-canvas" className="absolute inset-0" />
          <div ref={overlay} className="absolute inset-0 vignette" />
        </div>

        <div className="fixed top-0 left-0 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center pointer-events-auto">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <span className="text-orange-400 text-2xl font-bold group-hover:text-orange-300 transition">
                  《
                </span>
                <div className="text-4xl font-black animate-pulse text-orange-300">
                  Home
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Hand tracking with shared refs */}
        <HandDrumController
          setDrumTriggers={setDrumTriggers}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
        <WebcamOverlay videoRef={videoRef} canvasRef={canvasRef} />

        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32">
          <div className="text-center z-20 mb-16">
            <p className="text-3xl text-orange-200 font-light tracking-widest">
              Wave Your Hand to Play.
            </p>
          </div>

          <div
            id="virtual-piano-container"
            className="relative w-full max-w-5xl h-96 bg-black/40 backdrop-blur-2xl border-4 border-orange-400/60 rounded-3xl shadow-2xl shadow-orange-500/80 overflow-hidden flex items-center justify-center animate-pulse-slow"
          >
            <div className="w-full h-full">
              <Canvas
                style={{ width: "100%", height: "100%" }}
                camera={{ position: [0, 10, 35], fov: 45 }}
                shadows
              >
                <ambientLight intensity={0.8} />
                <directionalLight
                  position={[10, 15, 10]}
                  intensity={0.8}
                  castShadow
                />
                <Suspense fallback={null}>
                  <DrumsModel
                    url="/standard_drum_set.glb"
                    pressed={drumTriggers}
                  />
                  <OrbitControls />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl z-20">
            {[
              { gesture: "Fist", action: "KICK DRUM", icon: "✊" },
              { gesture: "Open Palm", action: "SNARE", icon: "🖐️" },
              { gesture: "Wave Fast", action: "HI-HAT", icon: "👋" },
            ].map((g, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="text-8xl group-hover:animate-bounce transition-all">
                    {g.icon}
                  </div>
                  <div className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-400 to-red-400 scale-150 transition-opacity" />
                </div>
                <p className="text-xl font-black text-orange-300">
                  {g.gesture}
                </p>
                <p className="text-gray-400 text-sm mt-1">→ {g.action}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative py-12 text-center border-t border-white/10 z-20">
          <p className="text-gray-500 text-sm">
            <span className="text-orange-300">HandSonicCanvas</span> • Drum
            Engine v3.0
          </p>
        </footer>

        {Array.from({ length: 70 }, (_, i) => (
          <div
            key={i}
            className="sparkle fixed pointer-events-none"
            style={{
              left: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Include your full CSS styling here for animations, colors, backgrounds etc. as before */}
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
          background: linear-gradient(to right, #f97316, #ef4444, #ec4899);
          background-size: 300%;
          animation: gradient 10s ease infinite;
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
          animation: scan 3s linear infinite;
        }
        .drum-floor {
          background:
            repeating-linear-gradient(
              0deg,
              #220 0px,
              #220 30px,
              #330 30px,
              #330 60px
            ),
            repeating-linear-gradient(
              90deg,
              #220 0px,
              #220 30px,
              #330 30px,
              #330 60px
            );
          background-size: 80px 80px;
          animation: ledPulse 4s infinite;
        }
        .drum-glow {
          background: radial-gradient(
            circle,
            rgba(255, 100, 0, 0.5) 0%,
            transparent 70%
          );
          filter: blur(100px);
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
          background: linear-gradient(90deg, transparent, #ff6600, transparent);
          box-shadow: 0 0 40px #ff6600;
        }
        .laser.h {
          height: 2px;
          width: 100%;
          top: 28%;
          animation: sweepH 8s linear infinite;
        }
        .laser.v {
          width: 2px;
          height: 100%;
          left: 50%;
          animation: sweepV 10s linear infinite;
        }
        .delay-2 {
          animation-delay: 2s;
        }
        .delay-3 {
          animation-delay: 3s;
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
            box-shadow: 0 0 40px #ff4400;
          }
          50% {
            box-shadow: 0 0 80px #ff0066;
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
          width: 5px;
          height: 5px;
          background: #ff6600;
          box-shadow: 0 0 25px #ff0066;
          animation: sparkle 8s linear infinite;
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
            transform: translateY(-100px) scale(1.5);
          }
        }
      `}</style>
    </>
  );
}
