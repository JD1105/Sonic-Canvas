import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Webcam from "./webcam";
import "./App.css";
import Home from "./Pages/Home";
import Piano from "./Pages/Piano";
import Drums from "./Pages/Drums";
import Guitar from "./Pages/Guitar";
import Flute from "./Pages/Flute";
import LearnDrums from "./Learn/Drums";
import GuitarGuide from "./Learn/Guitar";
import FluteGuide from "./Learn/Flute";
import PianoGuide from "./Learn/Piano";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/drums" element={<LearnDrums />} />
        <Route path="/learn/guitar" element={<GuitarGuide />} />
        <Route path="/learn/flute" element={<FluteGuide />} />
        <Route path="/learn/piano" element={<PianoGuide />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/drums" element={<Drums />} />
        <Route path="/guitar" element={<Guitar />} />
        <Route path="/flute" element={<Flute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
