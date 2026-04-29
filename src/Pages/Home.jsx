// src/App.jsx — AURORA: FULL PROFESSIONAL WEBSITE
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// import { initStage } from "./instrument";

export default function Home() {
  const overlay = useRef();
  const [activeSection, setActiveSection] = useState("welcome");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["welcome", "about", "instruments", "help"];
      const scrollY = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (
          el &&
          scrollY >= el.offsetTop &&
          scrollY < el.offsetTop + el.offsetHeight
        ) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  const instruments = [
    {
      name: "",
      path: "/drums",
      hue: 0,
      bgImage: "/bg/drums.png",
    },
    {
      name: "",
      path: "/piano",
      hue: 200,
      bgImage: "/bg/piano.png", // replace with real URL
    },

    {
      name: "",
      path: "/guitar",
      hue: 120,
      bgImage: "/bg/guitar.png",
    },
    {
      name: "",
      path: "/flute",
      hue: 280,
      bgImage: "/bg/flute.png",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % instruments.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, instruments.length]);

  const learnItems = [
    {
      instrument: "Drums",
      path: "/learn/drums",
      previewImage: "/bg/drums.png",
      desc: "Hit drums with fist or finger taps",
    },
    {
      instrument: "Piano",
      path: "/learn/piano",
      previewImage: "/bg/piano.png", // transparent PNG of hand over keys or landmark pose
      desc: "Play notes, chords with fingers",
    },

    {
      instrument: "Guitar",
      path: "/learn/guitar",
      previewImage: "/bg/guitar.png",
      desc: "Strum & fret using hand shapes",
    },
    {
      instrument: "Flute",
      path: "/learn/flute",
      previewImage: "/bg/flute.png",
      desc: "Cover holes & blow with precise fingers",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        {/* FIXED AURORA BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="sky-gradient" />
          <div className="nebula" />
          <div className="laser-container">
            <div className="laser h" />
            <div className="laser h delay-2" />
            <div className="laser v" />
            <div className="laser v delay-3" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-96 perspective-3d"></div>
          <div className="pedestal-glow" />
          <div id="instrument-canvas" className="absolute inset-0" />
          <div ref={overlay} className="absolute inset-0 z-10 vignette" />
        </div>

        {/* FLOATING NAV ORB — with glowing logo centerpiece */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className="flex items-center justify-center gap-5 
                       bg-black/60 backdrop-blur-xl 
                       border border-cyan-400/50 rounded-full 
                       px-6 py-3 shadow-[0_0_30px_rgba(0,255,255,0.3)] 
                       transition-all duration-300 
                       hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] 
                       animate-float"
          >
            {/* Logo as glowing centerpiece */}
            <div className="relative group">
              <img
                src="/logo.png"
                alt="Sonic Canvas Logo"
                className="w-20 h-20 md:w-8 md:h-8 object-contain 
                           drop-shadow-[0_0_12px_rgba(0,255,255,0.7)] 
                           transition-transform duration-500 
                           group-hover:rotate-12 group-hover:scale-110"
              />
              {/* Subtle rotating glow ring */}
              <div
                className="absolute inset-[-2px] rounded-full 
                           border border-cyan-400/30 border-dashed 
                           animate-spin-slow pointer-events-none"
              />
            </div>
            {/* <div className="h-7 w-px bg-cyan-400/30 mx-1" />{" "} */}
            {/* subtle separator */}
            <div className="flex items-center gap-4">
              {["welcome", "about", "instruments", "help"].map((sec) => (
                <button
                  key={sec}
                  onClick={() => scrollTo(sec)}
                  className={`text-sm capitalize font-medium transition-all duration-300
                              px-3 py-1 rounded-full
                              ${
                                activeSection === sec
                                  ? "bg-cyan-400 text-black shadow-md"
                                  : "text-white/80 hover:text-cyan-300 hover:bg-white/5"
                              }`}
                  aria-label={sec}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1. WELCOME */}
        <section
          id="welcome"
          className="relative min-h-screen flex items-center justify-center"
        >
          <div className="text-center z-20 px-6">
            <h1 className="text-6xl md:text-9xl font-black mb-6">
              <span
                className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 
                               bg-clip-text text-transparent animate-gradient font-futuristic"
              >
                Sonic Canvas
              </span>
            </h1>
            <p className="text-3xl md:text-5xl text-cyan-200 font-light tracking-widest">
              Gesture Powered Music Studio.
            </p>
            <p className="text-lg text-cyan-300 mt-6 max-w-2xl mx-auto"></p>
            <div className="mt-12 relative group">
              <button
                onClick={() => scrollTo("instruments")}
                className={`
      relative px-10 py-3 text-xl font-black tracking-widest uppercase
      bg-transparent /40 backdrop-blur-xl
      border-2 border-transparent rounded-full
      overflow-hidden
      transition-all duration-500
      shadow-[0_0_25px_rgba(0,255,255,0.25)]
      hover:shadow-[0_0_45px_rgba(0,255,255,0.6),0_0_80px_rgba(0,200,255,0.4)]
      hover:scale-105 hover:-translate-y-1
      active:scale-95 active:translate-y-0
      before:content-['']
      before:absolute before:inset-0 before:rounded-full
      before:bg-gradient-to-r before:from-cyan-500/10 before:via-purple-500/10 before:to-pink-500/10
      before:opacity-0 before:transition-opacity before:duration-500
      group-hover:before:opacity-100
      after:content-['']
      after:absolute after:inset-[-2px] after:rounded-full
      after:bg-gradient-to-r after:from-cyan-400 via-purple-500 to-pink-500
      after:opacity-0 after:transition-all after:duration-700
      group-hover:after:opacity-70
      group-hover:after:animate-gradient-border
    `}
              >
                {/* Inner text with slight glow */}
                <span className="relative z-10 bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(200,200,255,0.7)]">
                  ENTER THE STAGE
                </span>

                {/* Optional subtle shine/sweep effect layer */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine pointer-events-none" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. ABOUT */}
        <section id="about" className="relative py-32">
          <div className="max-w-7xl mx-auto px-6 z-20">
            <h2 className="text-5xl font-black font-futuristic text-center mb-20 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powered by Magic
            </h2>
            <div className="grid md:grid-cols-3 gap-10 perspective-1500">
              {[
                {
                  title: "MediaPipe",
                  bgImage: "/bg/mediapipe.png", // ← place your image here
                  desc: "Tracks 21 hand points in real-time",
                },
                {
                  title: "Three.js",
                  bgImage: "/bg/Three.png", // ← place your image here
                  desc: "Renders glowing 3D instruments",
                },
                {
                  title: "Web Audio",
                  bgImage: "/bg/head.png", // ← place your image here (or waveform/speaker glow)
                  desc: "Plays crystal-clear flutes & drums",
                },
              ].map((card, i) => (
                <div key={i} className="group">
                  <div
                    className="relative h-80 transform-gpu transition-all duration-700 
                        group-hover:scale-110 group-hover:-translate-y-8 overflow-hidden rounded-3xl"
                  >
                    {/* Glow backdrop that appears on hover */}
                    <div
                      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 
                          blur-3xl scale-150 opacity-0 group-hover:opacity-80 transition-opacity duration-700"
                    />

                    {/* Main card with background image */}
                    <div
                      className="relative h-full bg-white/10 backdrop-blur-2xl 
                          border-4 border-white/20 rounded-3xl 
                          p-8 md:p-10 flex flex-col items-center justify-center 
                          group-hover:border-cyan-400 transition-all duration-500
                          bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url(${card.bgImage})`,
                      }}
                    >
                      {/* Subtle dark overlay to ensure text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-3xl" />

                      {/* Title & Description – now with more prominence */}
                      <h3 className="relative z-10 text-3xl md:text-4xl font-black text-cyan-300 mb-4 drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]">
                        {card.title}
                      </h3>
                      <p className="relative z-10 text-gray-200 text-center text-lg md:text-xl font-medium max-w-xs">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="instruments" className="relative py-24">
          <div className="max-w-7xl mx-auto px-6 z-20">
            <h2 className="text-5xl font-futuristic text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              IGNITE YOUR SOUND
            </h2>

            {/* Slider wrapper */}
            <div
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/40 border-2 border-cyan-500/30"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Sliding container */}
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {instruments.map((inst) => (
                  <div
                    key={inst.path}
                    className="w-full flex-shrink-0 relative min-h-[420px] md:min-h-[480px] lg:min-h-[520px]"
                  >
                    {/* Background image – ~70% height */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[100%] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${inst.bgImage})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50" />
                    </div>

                    {/* Small gap / spacer between image and content (~5-8%) */}
                    {/* Content area – name + buttons + centered description */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[24%] 
                         
                         backdrop-transparent flex flex-col justify-end px-6 md:px-10 lg:px-14 pb-6 md:pb-8 lg:pb-10"
                    >
                      {/* Buttons – centered */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center mb-4 lg:mb-5">
                        <Link
                          to={inst.path}
                          className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold uppercase tracking-wider
                             bg-cyan-600/70 backdrop-blur-lg border-2 border-cyan-400 rounded-full text-white text-center
                             shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:bg-cyan-500 hover:shadow-[0_0_35px_rgba(0,255,255,0.8)]
                             hover:scale-105 active:scale-95 transition-all duration-400 min-w-[140px] sm:min-w-[160px]"
                        >
                          Play Instrument
                        </Link>

                        <button
                          onClick={() =>
                            alert(
                              `Learning guide for ${inst.name} – coming soon!`,
                            )
                          }
                          className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold uppercase tracking-wider
                             bg-purple-600/60 backdrop-blur-lg border-2 border-purple-400 rounded-full text-white text-center
                             shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:bg-purple-500 hover:shadow-[0_0_35px_rgba(168,85,247,0.8)]
                             hover:scale-105 active:scale-95 transition-all duration-400 min-w-[140px] sm:min-w-[160px]"
                        >
                          Learn How to Play
                        </button>
                      </div>

                      {/* Centered description */}
                      <p className="text-sm md:text-base lg:text-lg text-cyan-100/90 font-light max-w-2xl mx-auto drop-shadow-md text-center">
                        Master {inst.name.toLowerCase()} with intuitive
                        gestures. Real-time tracking, immersive sound.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* LEFT ARROW - no box, smaller */}
              <button
                onClick={() => {
                  setCurrentIndex(
                    (prev) =>
                      (prev - 1 + instruments.length) % instruments.length,
                  );
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 10000);
                }}
                className="
          absolute left-6 md:left-10 lg:left-14 top-1/2 -translate-y-1/2 z-30
          text-cyan-300/90 text-3xl md:text-4xl lg:text-4.5xl font-light
          drop-shadow-[0_0_12px_rgba(0,255,255,0.7)]
          hover:text-cyan-100 hover:drop-shadow-[0_0_28px_rgba(0,255,255,1)]
          hover:scale-125 active:scale-90
          transition-all duration-400
        "
                aria-label="Previous instrument"
              >
                ‹
              </button>

              {/* RIGHT ARROW - no box, smaller */}
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % instruments.length);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 10000);
                }}
                className="
          absolute right-6 md:right-10 lg:right-14 top-1/2 -translate-y-1/2 z-30
          text-cyan-300/90 text-3xl md:text-4xl lg:text-4.5xl font-light
          drop-shadow-[0_0_12px_rgba(0,255,255,0.7)]
          hover:text-cyan-100 hover:drop-shadow-[0_0_28px_rgba(0,255,255,1)]
          hover:scale-125 active:scale-90
          transition-all duration-400
        "
                aria-label="Next instrument"
              >
                ›
              </button>

              {/* Navigation dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                {instruments.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 10000);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-500
                        ${
                          currentIndex === idx
                            ? "bg-cyan-400 scale-125 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                            : "bg-white/40 hover:bg-white/70"
                        }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. HELP */}
        <section id="help" className="relative py-32">
          <div className="max-w-7xl mx-auto px-6 z-20">
            <h2 className="text-5xl font-black font-futuristic text-center mb-20 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Master the Gestures
            </h2>

            <div className="grid md:grid-cols-4 gap-10">
              {learnItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-4"
                >
                  {/* Card background + glow */}
                  <div className="relative h-80 bg-black/60 backdrop-blur-2xl border-4 border-white/20 rounded-3xl overflow-hidden">
                    {/* Gesture preview image as background */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-30"
                      style={{ backgroundImage: `url(${item.previewImage})` }}
                    >
                      {/* Subtle overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent/20" />
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 to-cyan-600/30 blur-3xl scale-125 opacity-0 group-hover:opacity-80 transition-opacity duration-700" />

                    {/* Content – bottom aligned */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-10 font-futuristic">
                      <h3 className="text-xl font-black text-cyan-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-3">
                        {item.instrument}
                      </h3>
                      {/* <p className="text-lg text-cyan-200/90 font-medium drop-shadow-md">
                        {item.desc}
                      </p> */}
                      <p className="mt-4 text-sm text-pink-300 font-semibold tracking-wide uppercase">
                        Learn Gestures →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. FOOTER */}
        <footer className="relative py-7 text-center border-t border-transparent/10 z-20">
          <p className="text-gray-500 text-sm">
            © 2025 <span className="text-cyan-300">HandSonicCanvas</span> •
            Built with <span className="text-pink-300">Three.js</span> +
            <span className="text-purple-300"> MediaPipe</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Made to inspire creativity and make music accessible to everyone,
            everywhere.
          </p>
        </footer>

        {/* SPARKLES */}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="sparkle fixed pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* CSS — HOLLYWOOD LEVEL */}
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
          background-size: 300%;
          animation: gradient 16s ease infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 28s linear infinite;
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
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          box-shadow: 0 0 40px #00ffff;
        }
        .laser.h {
          height: 2px;
          width: 100%;
          top: 28%;
          animation: sweepH 9s linear infinite;
        }
        .laser.v {
          width: 2px;
          height: 100%;
          left: 50%;
          animation: sweepV 11s linear infinite;
        }
        .delay-2 {
          animation-delay: -4s;
        }
        .delay-3 {
          animation-delay: -7s;
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

        .pedestal-glow {
          position: fixed;
          bottom: 26%;
          left: 50%;
          width: 600px;
          height: 600px;
          background: radial-gradient(
            circle,
            rgba(0, 255, 255, 0.4) 0%,
            transparent 65%
          );
          filter: blur(80px);
          transform: translateX(-50%);
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.7;
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
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 15px #00ffff;
          animation: sparkle 10s linear infinite;
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
            transform: translateY(-100px) scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
