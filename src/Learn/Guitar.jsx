function GuitarGuide() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero */}
      <div className="relative py-24 md:py-32 bg-gradient-to-b from-black via-black/90 to-black">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-futuristic mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400 bg-clip-text text-transparent animate-gradient-x">
            Guitar Gesture Guide
          </h1>

          <p className="text-xl md:text-2xl text-orange-200/90 font-light tracking-wide max-w-4xl mx-auto">
            Play a virtual guitar using only your hands.
            <br className="hidden sm:block" />
            <span className="text-yellow-300 font-medium">
              Left hand selects frets → Right hand plucks strings
            </span>
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-20 md:space-y-28">
          {/* Neutral */}
          <div className="bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-2xl border border-yellow-500/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-yellow-900/30">
            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 rounded-2xl overflow-hidden bg-black/40 border border-yellow-500/30">
              <img
                src="/gestures/guitar/AllOpen.png"
                alt="All fingers open"
                className="w-full h-full object-contain p-3 drop-shadow-[0_0_15px_rgba(255,200,0,0.7)] animate-pulse-slow"
              />
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-yellow-300 mb-6">
              All Fingers Open
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Neutral position — no strings pressed and no pluck
              <br />
              Return here to reset your hand position
            </p>
          </div>

          {/* Hands Grid */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* LEFT HAND */}
            <div className="space-y-10">
              <h3 className="text-4xl md:text-5xl font-black text-red-400 text-center md:text-left mb-8">
                Left Hand — Frets
              </h3>

              {[
                {
                  finger: "Thumb",
                  image: "/gestures/guitar/LeftThumb.png",
                  sound: "Fret 1",
                  desc: "Press first fret on the guitar neck",
                },
                {
                  finger: "Index",
                  image: "/gestures/guitar/LeftIndex.png",
                  sound: "Fret 2",
                  desc: "Second fret — higher pitch",
                },
                {
                  finger: "Middle",
                  image: "/gestures/guitar/LeftMiddle.png",
                  sound: "Fret 3",
                  desc: "Third fret — brighter tone",
                },
                {
                  finger: "Ring",
                  image: "/gestures/guitar/LeftRing.png",
                  sound: "Fret 4",
                  desc: "Fourth fret — strong lead notes",
                },
                {
                  finger: "Little",
                  image: "/gestures/guitar/LeftLittle.png",
                  sound: "Fret 5",
                  desc: "Fifth fret — highest pitch",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-black/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 md:p-8 hover:border-red-400/70 hover:shadow-[0_0_30px_rgba(255,80,80,0.4)] transition-all duration-400"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-yellow-500/20 group-hover:border-yellow-400/50 transition-all duration-400">
                      <img
                        src={item.image}
                        alt={item.finger}
                        className="w-full h-full object-contain p-2 drop-shadow-[0_0_12px_rgba(255,200,0,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(255,200,0,0.9)] group-hover:scale-105 transition-all duration-500"
                      />
                    </div>

                    <div className="text-center md:text-left">
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {item.finger} closed
                      </h4>

                      <p className="text-xl text-yellow-300 font-semibold mb-1">
                        {item.sound}
                      </p>

                      <p className="text-lg text-gray-200">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT HAND */}
            <div className="space-y-10">
              <h3 className="text-4xl md:text-5xl font-black text-orange-400 text-center md:text-left mb-8">
                Right Hand — Strings
              </h3>

              {[
                {
                  finger: "Thumb",
                  image: "/gestures/guitar/RightThumb.png",
                  sound: "String 1",
                  desc: "Lowest string — deep bass tone",
                },
                {
                  finger: "Index",
                  image: "/gestures/guitar/RightIndex.png",
                  sound: "String 2",
                  desc: "Second string — smooth tone",
                },
                {
                  finger: "Middle",
                  image: "/gestures/guitar/RightMiddle.png",
                  sound: "String 3",
                  desc: "Middle string",
                },
                {
                  finger: "Ring",
                  image: "/gestures/guitar/RightRing.png",
                  sound: "String 4",
                  desc: "Higher guitar string",
                },
                {
                  finger: "Little",
                  image: "/gestures/guitar/RightLittle.png",
                  sound: "String 5",
                  desc: "Bright string tone",
                },
                {
                  finger: "All fingers closed",
                  image: "/gestures/guitar/AllClosed.png",
                  sound: "String 6",
                  desc: "Highest string",
                },
                {
                  finger: "Thumb + Little Open",
                  image: "/gestures/guitar/RightThumbandLittle.png",
                  sound: "Strum All Strings",
                  desc: "Play the entire chord",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-black/50 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 md:p-8 hover:border-orange-400/70 hover:shadow-[0_0_30px_rgba(255,150,0,0.4)] transition-all duration-400"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-yellow-500/20 group-hover:border-yellow-400/50 transition-all duration-400">
                      <img
                        src={item.image}
                        alt={item.sound}
                        className="w-full h-full object-contain p-2 drop-shadow-[0_0_12px_rgba(255,200,0,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(255,200,0,0.9)] group-hover:scale-105 transition-all duration-500"
                      />
                    </div>

                    <div className="text-center md:text-left">
                      <h4 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {item.finger}
                      </h4>

                      <p className="text-xl text-yellow-300 font-semibold mb-1">
                        {item.sound}
                      </p>

                      <p className="text-lg text-gray-200">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center mt-16">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-8">
              Guitar Playing Tips
            </h3>

            <div className="grid md:grid-cols-3 gap-8 text-lg text-gray-200">
              <div>
                <div className="text-6xl mb-4">🎸</div>
                <p>Left hand controls the pitch</p>
              </div>

              <div>
                <div className="text-6xl mb-4">⚡</div>
                <p>Right hand plucks the strings</p>
              </div>

              <div>
                <div className="text-6xl mb-4">🔥</div>
                <p>Strum gesture plays full chords</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500 text-lg">
            <p>Practice fret changes slowly before trying fast strums</p>
            <p className="mt-3">
              Powered by MediaPipe — real-time hand tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuitarGuide;
