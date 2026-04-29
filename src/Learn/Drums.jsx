function Drums() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative py-24 md:py-32 bg-gradient-to-b from-black via-black/90 to-black">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-futuristic mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
            Drums Gesture Guide
          </h1>
          <p className="text-xl md:text-2xl text-cyan-200/90 font-light tracking-wide max-w-4xl mx-auto">
            Trigger every drum element with simple finger closures — no physical
            drums required.
            <br className="hidden sm:block" />
            <span className="text-pink-300 font-medium">
              Close a finger → play the sound
            </span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-20 md:space-y-28">
          {/* Neutral State – shown first */}
          <div className="bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-cyan-900/30">
            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 rounded-2xl overflow-hidden bg-black/40 border border-cyan-500/30">
              <img
                src="/gestures/drums/AllOpen.png"
                alt="All fingers open - neutral position"
                className="w-full h-full object-contain p-3 drop-shadow-[0_0_15px_rgba(0,255,255,0.7)] animate-pulse-slow"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-cyan-300 mb-6">
              All Fingers Open
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Neutral position — no sound triggered
              <br />
              Return here after each hit or to stop playing
            </p>
          </div>

          {/* Two-column layout for hands */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Left Hand */}
            <div className="space-y-10">
              <h3 className="text-4xl md:text-5xl font-black text-pink-400 text-center md:text-left mb-8">
                Left Hand
              </h3>

              {[
                {
                  finger: "Thumb",
                  image: "/gestures/drums/LeftThumb.png",
                  sound: "Bass Drum",
                  desc: "Deep kick — the heartbeat of the rhythm",
                },
                {
                  finger: "Index",
                  image: "/gestures/drums/LeftIndex.png",
                  sound: "Crash Cymbal",
                  desc: "Bright, explosive accent crash",
                },
                {
                  finger: "Middle",
                  image: "/gestures/drums/LeftMiddle.png",
                  sound: "High Tom",
                  desc: "Higher tom — punchy and sharp",
                },
                {
                  finger: "Ring",
                  image: "/gestures/drums/LeftRing.png",
                  sound: "Floor Tom",
                  desc: "Low, resonant floor tom — depth",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-black/50 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 md:p-8 hover:border-pink-400/70 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all duration-400"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-cyan-500/20 group-hover:border-cyan-400/50 transition-all duration-400">
                      <img
                        src={item.image}
                        alt={`${item.finger} closed - ${item.sound}`}
                        className="w-full h-full object-contain p-2 drop-shadow-[0_0_12px_rgba(0,255,255,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.9)] group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {item.finger} closed
                      </h4>
                      <p className="text-xl text-cyan-300 font-semibold mb-1">
                        {item.sound}
                      </p>
                      <p className="text-lg text-gray-200">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Hand */}
            <div className="space-y-10">
              <h3 className="text-4xl md:text-5xl font-black text-purple-400 text-center md:text-left mb-8">
                Right Hand
              </h3>

              {[
                {
                  finger: "Thumb",
                  image: "/gestures/drums/RightThumb.png",
                  sound: "Snare Drum",
                  desc: "Sharp, cracking backbeat",
                },
                {
                  finger: "Index",
                  image: "/gestures/drums/RightIndex.png",
                  sound: "Hi-Hat Cymbal",
                  desc: "Tight chick or open sizzle",
                },
                {
                  finger: "Middle",
                  image: "/gestures/drums/RightMiddle.png",
                  sound: "Ride Cymbal",
                  desc: "Crisp, ringing rhythm keeper",
                },
                {
                  finger: "Ring",
                  image: "/gestures/drums/RightRing.png",
                  sound: "Mid Tom",
                  desc: "Medium tom — versatile fill sound",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-black/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 md:p-8 hover:border-purple-400/70 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-400"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-cyan-500/20 group-hover:border-cyan-400/50 transition-all duration-400">
                      <img
                        src={item.image}
                        alt={`${item.finger} closed - ${item.sound}`}
                        className="w-full h-full object-contain p-2 drop-shadow-[0_0_12px_rgba(0,255,255,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.9)] group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {item.finger} closed
                      </h4>
                      <p className="text-xl text-cyan-300 font-semibold mb-1">
                        {item.sound}
                      </p>
                      <p className="text-lg text-gray-200">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center mt-16">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-8">
              Quick Tips for Better Playing
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-lg text-gray-200">
              <div>
                <div className="text-6xl mb-4">⚡</div>
                <p>Quick close = sharp attack</p>
              </div>
              <div>
                <div className="text-6xl mb-4">🌊</div>
                <p>Hold closed = sustained hi-hat</p>
              </div>
              <div>
                <div className="text-6xl mb-4">🔄</div>
                <p>Combine both hands for full grooves</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center mt-16 text-gray-500 text-lg">
            <p>
              Practice slowly at first → build speed → create your own beats
            </p>
            <p className="mt-3">
              Powered by MediaPipe — 21 hand landmarks tracked in real time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drums;
