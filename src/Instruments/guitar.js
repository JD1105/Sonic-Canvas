let prevLeft = [];
let prevRight = [];
let selectedFret = 0;

import string1 from "../sound/bass_drum.mp3";
import string2 from "../sound/crash.mp3";
import string3 from "../sound/htom.mp3";
import string4 from "../sound/ftom.mp3";

import string5 from "../sound/snare.mp3";
import string6 from "../sound/hihat.mp3";
import string7 from "../sound/ride.mp3";
import string8 from "../sound/mtom.mp3";

function playStringSound(strumState, prevState, audio) {
  if (strumState === "closed" && prevState !== "closed") {
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Audio play error:", err));
  }
}

function getState(states, fingers) {
  for (const finger of fingers) {
    if (states[finger] === "closed") return "closed";
  }
  return "open";
}

const guitarSounds = [
  [
    new Audio(string1),
    new Audio(string2),
    new Audio(string3),
    new Audio(string4),
    new Audio(string5),
  ],
  [
    new Audio(string6),
    new Audio(string7),
    new Audio(string8),
    new Audio(string1),
    new Audio(string2),
  ],
  [
    new Audio(string3),
    new Audio(string4),
    new Audio(string5),
    new Audio(string6),
    new Audio(string7),
  ],
  [
    new Audio(string8),
    new Audio(string1),
    new Audio(string2),
    new Audio(string3),
    new Audio(string4),
  ],
  [
    new Audio(string5),
    new Audio(string6),
    new Audio(string7),
    new Audio(string8),
    new Audio(string1),
  ],
  [
    new Audio(string2),
    new Audio(string3),
    new Audio(string4),
    new Audio(string5),
    new Audio(string6),
  ],
];

export default function guitar(left = [], right = []) {
  // Left hand controls fret selection (which fret is pressed)
  const frets = [
    getState(left, [0]),
    getState(left, [1]),
    getState(left, [2]),
    getState(left, [3]),
    getState(left, [4]),
  ];

  // Right hand controls strumming or plucking (motion or gesture)
  const strings = [
    getState(right, [0]),
    getState(right, [1]),
    getState(right, [2]),
    getState(right, [3]),
    getState(right, [4]),
    getState(right, [5]),
  ];
  const fretIdx = frets.findIndex((s) => s === "closed");
  selectedFret = fretIdx !== -1 ? fretIdx : 0;

  strings.forEach((state, i) => {
    const prev = prevRight[i] || "open";
    playStringSound(state, prev, guitarSounds[i][selectedFret]);
  });

  prevLeft = [...frets];
  prevRight = [...strings];
}
