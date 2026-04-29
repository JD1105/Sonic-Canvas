function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isThumbOpen(landmarks, handedness) {
  if (!landmarks) return null;

  const tip = landmarks[4];
  const ip = landmarks[3];
  const mcp = landmarks[2];

  if (handedness === "Right") {
    return tip.x < ip.x && tip.x < mcp.x;
  } else {
    return tip.x > ip.x && tip.x > mcp.x;
  }
}

function isFingerOpen(landmarks, tipIndex, pipIndex) {
  if (!landmarks) return null;
  return (
    dist(landmarks[tipIndex], landmarks[0]) >
    dist(landmarks[pipIndex], landmarks[0])
  );
}

export default function getFingerStates(landmarks, handedness) {
  if (!landmarks) return ["null", "null", "null", "null", "null"];

  return [
    isThumbOpen(landmarks, handedness) ? "open" : "closed",
    isFingerOpen(landmarks, 8, 6) ? "open" : "closed", // index
    isFingerOpen(landmarks, 12, 10) ? "open" : "closed", // middle
    isFingerOpen(landmarks, 16, 14) ? "open" : "closed", // ring
    isFingerOpen(landmarks, 20, 18) ? "open" : "closed", // pinky
  ];
}
