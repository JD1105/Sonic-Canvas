function PianoGuide() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Hero */}
      <div className="relative py-24 md:py-32 bg-gradient-to-b from-black via-black/90 to-black">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            Piano Gesture Guide
          </h1>

          <p className="text-xl md:text-2xl text-cyan-200/90 font-light max-w-4xl mx-auto">
            Play a full piano using only your hands.
            <br />
            <span className="text-pink-300 font-medium">
              Choose Octave → Point → Tap → Hear the note
            </span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-24">
        {/* STEP 1 — OCTAVE SELECTION */}
        <div className="bg-black/60 border border-pink-500/30 rounded-3xl p-10 text-center">
          <h2 className="text-4xl font-black text-pink-300 mb-6">
            Step 1 — Choose Octave (Right Hand)
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Use your <span className="text-cyan-300">right hand</span> to select
            the octave. The number of fingers you open determines the octave.
          </p>

          {/* Octave Gesture Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <div className="text-center">
              <img
                src="/gestures/piano/o1.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">1 Finger → Octave 1</p>
            </div>

            <div className="text-center">
              <img
                src="/gestures/piano/o2.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">2 Fingers → Octave 2</p>
            </div>

            <div className="text-center">
              <img
                src="/gestures/piano/o3.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">3 Fingers → Octave 3</p>
            </div>

            <div className="text-center">
              <img
                src="/gestures/piano/o4.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">4 Fingers → Octave 4</p>
            </div>

            <div className="text-center">
              <img
                src="/gestures/piano/o5.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">5 Fingers → Octave 5</p>
            </div>

            <div className="text-center">
              <img
                src="/gestures/piano/o6.png"
                className="w-32 h-32 mx-auto object-contain mb-3"
              />
              <p className="text-gray-300">Fist → Octave 6</p>
            </div>
          </div>
        </div>

        {/* STEP 2 — PLAY NOTES */}
        <div className="bg-black/60 border border-purple-500/30 rounded-3xl p-10 text-center">
          <h2 className="text-4xl font-black text-purple-300 mb-6">
            Step 2 — Point and Tap a Note
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Use your <span className="text-pink-400">left index finger</span> to
            point to a note box on the screen, then tap downward to play the
            note.
          </p>

          <div className="flex justify-center gap-12 flex-wrap">
            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 rounded-2xl overflow-hidden bg-black/40 border border-cyan-400/30">
                <img
                  src="/gestures/piano/t1.png"
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <p className="text-gray-300 text-lg">Point to a note box</p>
            </div>

            <div className="text-center">
              <div className="w-40 h-40 mx-auto mb-4 rounded-2xl overflow-hidden bg-black/40 border border-purple-400/30">
                <img
                  src="/gestures/piano/t2.png"
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <p className="text-gray-300 text-lg">Tap downward to play</p>
            </div>
          </div>
        </div>

        {/* Piano Grid Layout */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-white/10 rounded-3xl p-10 text-center">
          <h3 className="text-3xl font-black mb-6">Piano Grid Layout</h3>

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto text-xl">
            {[
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
            ].map((note, i) => (
              <div
                key={i}
                className="border border-cyan-400/40 rounded-xl py-4 bg-black/40"
              >
                {note}
              </div>
            ))}
          </div>

          <p className="mt-6 text-gray-300">
            Move your finger between boxes to choose notes.
          </p>
        </div>

        {/* Playing Tips */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-white/10 rounded-3xl p-10 text-center">
          <h3 className="text-3xl font-black mb-8">Playing Tips</h3>

          <div className="grid md:grid-cols-3 gap-8 text-lg text-gray-200">
            <div>
              <div className="text-6xl mb-4">⚡</div>
              <p>Fast tap = sharper response</p>
            </div>

            <div>
              <div className="text-6xl mb-4">🎯</div>
              <p>Keep finger centered in the box</p>
            </div>

            <div>
              <div className="text-6xl mb-4">🎹</div>
              <p>Combine octave changes for melodies</p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-lg">
          <p>MediaPipe tracks 21 hand landmarks in real time</p>
        </div>
      </div>
    </div>
  );
}

export default PianoGuide;
