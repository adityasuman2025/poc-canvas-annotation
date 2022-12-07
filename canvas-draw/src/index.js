import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import CanvasDraw from "react-canvas-draw";

import Img from "./amrit.jpg";
import "./styles.css";

function App() {
  function handleChange(e) {
    console.log("change", e)
  }

  return (
    <div className="App">
      <h1><a target="_blank" href="https://embiem.github.io/react-canvas-draw/">React Canvas Draw</a></h1>
      <br />

      <CanvasDraw
        canvasWidth={643}
        canvasHeight={1045}
        lazyRadius={5}
        brushRadius={5}
        imgSrc={Img}
        enablePanAndZoom={true}
        onChange={handleChange}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);