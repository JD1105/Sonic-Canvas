import { HandLandmarker } from "@mediapipe/tasks-vision";
import piano from "./Instruments/piano";
import drums from "./Instruments/drums";
import guitar from "./Instruments/guitar";

export function selectInstrument(instrument, left, right) {
  switch (instrument) {
    case "piano":
      return piano(left, right);
    case "drums":
      return drums(left, right);
    case "guitar":
      return guitar(left, right);
    default:
      return false;
  }
}

// A helper to draw landmarks (optional, can be kept here for neatness)
export function drawHand(drawingUtils, landmarks, handedness) {
  const colors = {
    Right: "red",
    Left: "blue",
  };

  const color = colors[handedness] || "gray";

  drawingUtils.drawLandmarks(landmarks, { color, radius: 5 });
  drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
    color,
    lineWidth: 2,
  });
}
