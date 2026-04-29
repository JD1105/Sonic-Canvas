function FluteGuide() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero */}
      <div className="relative py-24 md:py-32 bg-gradient-to-b from-black via-black/90 to-black">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 
          bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 
          bg-clip-text text-transparent animate-gradient-x"
          >
            Flute Gesture Guide
          </h1>

          <p className="text-xl md:text-2xl text-teal-200 max-w-4xl mx-auto">
            Play a virtual flute using only your hands.
            <br />
            <span className="text-cyan-300 font-medium">
              Close thumb to blow • Open fingers to change notes
            </span>
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Thumb trigger */}
        <div className="bg-black/50 border border-teal-400/30 rounded-3xl p-10 text-center mb-20 backdrop-blur-xl">
          <div className="w-40 h-40 mx-auto mb-8 rounded-2xl overflow-hidden bg-black/40 border border-teal-400/30">
            <img
              src="/gestures/flute/LeftThumb.png"
              alt="Thumb closed"
              className="w-full h-full object-contain p-3 drop-shadow-[0_0_15px_rgba(0,255,200,0.8)]"
            />
          </div>

          <h2 className="text-4xl font-black text-teal-300 mb-4">
            Close Left Thumb
          </h2>

          <p className="text-xl text-gray-300">
            This acts like blowing air into the flute.
            <br />
            Without the thumb closed, no sound will play.
          </p>
        </div>

        {/* Notes grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              note: "Sa",
              image: "/gestures/flute/RightIndex.png",
              desc: "All holes covered — base note",
              pattern: "Right Index Closed",
            },
            {
              note: "Re",
              image: "/gestures/flute/RightIndexandMiddle.png",
              desc: "Open first finger",
              pattern: "Right Index and Middle Closed",
            },
            {
              note: "Ga",
              image: "/gestures/flute/RightThumbandLittle.png",
              desc: "Open two fingers",
              pattern: "Right Index, Middle and RingClosed",
            },
            {
              note: "Ma",
              image: "/gestures/flute/L1.png",
              desc: "Open three fingers",
              pattern: "Right Index, Middle, Ring and Left Thumb, Index Closed",
            },
            {
              note: "Pa",
              image: "/gestures/flute/L2.png",
              desc: "Open four fingers",
              pattern:
                "Right Index, Middle, Ring and Left Thumb, Index, Middle Closed",
            },
            {
              note: "Dha",
              image: "/gestures/flute/L3.png",
              desc: "All fingers open — highest pitch",
              pattern:
                "Right Index, Middle, Ring and Left Thumb, Index, Middle, Ring Closed",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-black/50 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-8 hover:border-teal-300/80 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all"
            >
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden bg-black/40 border border-teal-500/30">
                <img
                  src={item.image}
                  alt={item.note}
                  className="w-full h-full object-contain p-2 
                  drop-shadow-[0_0_12px_rgba(0,255,200,0.7)]
                  group-hover:scale-105 transition"
                />
              </div>

              <h3 className="text-3xl font-black text-teal-300 mb-2 text-center">
                {item.note}
              </h3>

              {/* <p className="text-gray-300 text-center mb-2">{item.desc}</p> */}

              <p className="text-sm text-gray-400 text-center">
                {item.pattern}
              </p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-white/10 rounded-3xl p-10 text-center mt-20">
          <h3 className="text-3xl font-black mb-8">Playing Tips</h3>

          <div className="grid md:grid-cols-3 gap-8 text-lg text-gray-200">
            <div>
              <div className="text-6xl mb-4">👍</div>
              <p>Close thumb to start the sound</p>
            </div>

            <div>
              <div className="text-6xl mb-4">🎵</div>
              <p>Open fingers gradually to raise pitch</p>
            </div>

            <div>
              <div className="text-6xl mb-4">🎶</div>
              <p>Move fingers smoothly for melodies</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-lg">
          <p>Practice slowly and build melodies like Happy Birthday 🎂</p>
          <p className="mt-2">Powered by MediaPipe hand tracking</p>
        </div>
      </div>
    </div>
  );
}

export default FluteGuide;
