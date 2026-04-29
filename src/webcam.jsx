import React, { useRef, useState, useEffect } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { drawHand, selectInstrument } from "./instruments";
import getFingerStates from "./Instruments/fingers";

const Webcam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationIdRef = useRef(null);

  const [message, setMessage] = useState("Initializing...");
  const [instrument, setInstrument] = useState("");
  const instrumentRef = useRef(instrument);

  useEffect(() => {
    instrumentRef.current = instrument;
  }, [instrument]);

  // Initialize MediaPipe HandLandmarker model
  useEffect(() => {
    let isMounted = true;

    async function setup() {
      setMessage("Loading MediaPipe...");
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setMessage("Hand landmarker model loaded.");
          startVideo();
        } else {
          await landmarker.close();
        }
      } catch (err) {
        setMessage(`Initialization error: ${err.message}`);
        console.error(err);
      }
    }

    setup();

    // Cleanup
    return () => {
      isMounted = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close().catch(console.error);
        landmarkerRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start webcam and processing
  async function startVideo() {
    setMessage("Accessing webcam...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setMessage("Webcam started.");

        videoRef.current.width = videoRef.current.videoWidth;
        videoRef.current.height = videoRef.current.videoHeight;

        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }

        beginProcessing();
      };
    } catch (err) {
      setMessage(`Webcam error: ${err.message}`);
      console.error(err);
    }
  }

  // Processing loop
  function beginProcessing() {
    const ctx = canvasRef.current.getContext("2d");
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const drawingUtils = new DrawingUtils(ctx);

    async function processFrame() {
      if (!video || !landmarker || video.readyState !== 4) {
        animationIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        video,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      try {
        const results = await landmarker.detectForVideo(
          video,
          performance.now()
        );
        if (results.landmarks && results.landmarks.length > 0) {
          let left = [];
          let right = [];

          results.landmarks.forEach((landmarks, i) => {
            const handedness =
              results.handednesses[i]?.[0]?.categoryName || "Unknown";

            drawHand(drawingUtils, landmarks, handedness);

            if (handedness === "Left") {
              left = getFingerStates(landmarks, handedness);
            } else if (handedness === "Right") {
              right = getFingerStates(landmarks, handedness);
            }
          });

          selectInstrument(instrumentRef.current, left, right);
          setMessage(`Detected ${results.landmarks.length} hand(s).`);
        } else {
          setMessage("No hands detected.");
        }
      } catch (err) {
        setMessage("Detection error.");
        console.error(err);
      }

      ctx.restore();
      animationIdRef.current = requestAnimationFrame(processFrame);
    }

    animationIdRef.current = requestAnimationFrame(processFrame);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p>{message}</p>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: "800px" }} />
    </div>
  );
};

export default Webcam;
