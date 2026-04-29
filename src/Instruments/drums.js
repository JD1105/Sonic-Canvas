// Preload audio files
import bass_drum from "../sound/bass_drum.mp3";
import crash_drum from "../sound/crash.mp3";
import htom_drum from "../sound/htom.mp3";
import ftom_drum from "../sound/ftom.mp3";

import snare_drum from "../sound/snare.mp3";
import hihat_drum from "../sound/hihat.mp3";
import ride_drum from "../sound/ride.mp3";
import mtom_drum from "../sound/mtom.mp3";

const bass = new Audio(bass_drum);
const crash = new Audio(crash_drum);
const htom = new Audio(htom_drum);
const ftom = new Audio(ftom_drum);

const snare = new Audio(snare_drum);
const hihat = new Audio(hihat_drum);
const ride = new Audio(ride_drum);
const mtom = new Audio(mtom_drum);

// Previous states (track per finger)
let prevLeft = [];
let prevRight = [];

// Helper: play only when state changes to "closed"
function playFingerSound(fingerState, prevState, audio) {
  if (fingerState == "closed" && prevState !== "closed") {
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

export default function drums(left = [], right = []) {
  //right hand
  const _bass = getState(left, [0]);
  const _crash = getState(left, [1]);
  const _htom = getState(left, [2, 3]);
  const _ftom = getState(left, [4]);

  //left hand
  const _snare = getState(right, [0]);
  const _hihat = getState(right, [1]);
  const _ride = getState(right, [2, 3]);
  const _mtom = getState(right, [4]);

  playFingerSound(_bass, prevLeft[0], bass);
  playFingerSound(_crash, prevLeft[1], crash);
  playFingerSound(_htom, prevLeft[2], htom);
  playFingerSound(_ftom, prevLeft[3], ftom);
  playFingerSound(_snare, prevRight[0], snare);
  playFingerSound(_hihat, prevRight[1], hihat);
  playFingerSound(_ride, prevRight[2], ride);
  playFingerSound(_mtom, prevRight[3], mtom);

  prevLeft = [...left];
  prevRight = [...right];
}
