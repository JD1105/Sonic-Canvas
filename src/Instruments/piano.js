// src/Instruments/piano.js
let prevLeft = [];
let prevRight = [];
let selectedOctave = 0;

// Keep the default export function (so instruments.selectInstrument(...) continues to work)
export default function piano(left = [], right = []) {
  // This function remains available for "selectInstrument" style usage by other modules.
  // It only computes octave/key "states" and updates prev arrays (no side effects)
  const octaves = [
    getState(right, [0]),
    getState(right, [0, 1]),
    getState(right, [0, 2]),
    getState(right, [0, 3]),
    getState(right, [0, 4]),
    getState(right, [0, 1, 2, 3, 4, 5]),
  ];

  const keys = [
    getState(left, [0]),
    getState(left, [1]),
    getState(left, [2]),
    getState(left, [3]),
    getState(left, [4]),
    getState(left, [0, 1]),
    getState(left, [0, 2]),
    getState(left, [0, 3]),
    getState(left, [0, 4]),
    getState(left, [2, 3, 4]),
    getState(left, [1, 2, 3, 4, 5]),
    getState(left, [0, 1, 2, 3, 4, 5]),
  ];

  const idx = octaves.findIndex((s) => s === "closed");
  if (idx !== -1) selectedOctave = idx;

  // Update previous states
  prevLeft = [...keys];
  prevRight = [...octaves];

  // return a small summary (keeps it pure and safe)
  return { keys, octaves, selectedOctave };
}

// Utility helpers (kept compatible with previous code)
function playFingerSound(fingerState, prevState, audio) {
  if (fingerState === "closed" && prevState !== "closed") {
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Audio play error:", err));
  }
}

function getState(states, fingers) {
  for (const finger of fingers) {
    if (states[finger] === "closed") {
      return "closed";
    }
  }
  return "open";
}

// ---------------------------
// New: named export used by pages/Piano.jsx
// updatePianoFromFingers maps finger states -> keys, triggers sound via pianoRef.synth
// and updates the 3D model via pianoRef.setPressedKeys
// ---------------------------
export function updatePianoFromFingers(
  fingerStates = ["null", "null", "null", "null", "null"],
  pianoRef
) {
  // Safety checks
  if (!pianoRef || !pianoRef.current) return;

  // fingerStates is array of 5 strings: thumb, index, middle, ring, pinky
  // We'll map fingers to a set of key indices (simple, deterministic mapping):
  // index -> key 0, middle -> key 2, ring -> key 4, pinky -> key 5, thumb -> key 7 (example)
  // You can customize mapping later to match your GLB layout
  const fingerToKeyIndices = {
    0: [7], // thumb
    1: [0, 6], // index
    2: [2, 8], // middle
    3: [4, 10], // ring
    4: [5, 11], // pinky
  };

  // Build pressedKeys object expected by models/piano.jsx (index -> boolean)
  const pressedKeys = {};

  for (let i = 0; i < 79; i++) {
    // default to false
    pressedKeys[i] = false;
  }

  // If fingerStates contains "null" or invalid, do nothing (leave all false)
  if (!Array.isArray(fingerStates) || fingerStates.length < 5) {
    pianoRef.current.setPressedKeys &&
      pianoRef.current.setPressedKeys(pressedKeys);
    return;
  }

  // Determine octave shift from "right hand" states if present in previous API.
  // For simplicity: count number of "closed" entries in fingerStates to choose octave offset
  let numClosed = fingerStates.filter((s) => s === "closed").length;
  // clamp octave between -2 and +2 relative shift
  const octaveShift = Math.max(-2, Math.min(2, Math.floor(numClosed - 2)));

  // A helper to generate note names aligned with models/piano.jsx
  const keyIndexToNote = generateFullKeyNoteMap(3, 79); // same startOctave=3 and totalKeys=79

  // When a finger becomes closed, play its mapped key(s)
  for (let f = 0; f < 5; f++) {
    const s = fingerStates[f];
    const prev = prevLeft[f] || "open"; // prevLeft keeps previous key states in original impl
    // If state changed to "closed" from something else, play sounds
    if (s === "closed" && prev !== "closed") {
      const indices = fingerToKeyIndices[f] || [];
      indices.forEach((ki) => {
        // shift key index by octaveShift * 12 where possible
        let playIndex = ki + octaveShift * 12;
        if (playIndex < 0) playIndex = 0;
        if (playIndex >= 79) playIndex = 78;
        pressedKeys[playIndex] = true;

        // attempt to play via Tone synth available on pianoRef.current.synth
        try {
          const synth = pianoRef.current.synth;
          const note = keyIndexToNote[playIndex];
          if (synth && typeof synth.triggerAttackRelease === "function") {
            synth.triggerAttackRelease(note, "8n");
          }
        } catch (err) {
          console.error("Synth play error:", err);
        }
      });
    }
  }

  // Provide the pressedKeys to the 3D piano for animation
  pianoRef.current.setPressedKeys &&
    pianoRef.current.setPressedKeys(pressedKeys);

  // Update prevLeft and prevRight like the previous implementation expects
  // (we keep prevLeft as an array of 5 finger-level "open"/"closed")
  prevLeft = fingerStates.slice();
  prevRight = []; // we don't use right-hand octaves here; kept for compatibility
}

// Replicate the generator present in models/piano.jsx to make mapping consistent
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
