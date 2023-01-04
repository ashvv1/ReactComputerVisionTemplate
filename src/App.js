// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
// 1. TODO - Import required model here
// e.g. import * as tfmodel from "@tensorflow-models/tfmodel";
import * as cocossd from "@tensorflow-models/coco-ssd"
import Webcam from "react-webcam";
import "./App.css";
// 2. TODO - Import drawing utility here
// e.g. import { drawRect } from "./utilities";
import { drawRect } from "./utilities";
const alarmSound = require('./sounds/alarm.mp3')

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [alarmActive, setAlarmActive] = useState(false);

  const alarmPlayer = useRef(null);


  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    // e.g. const net = await cocossd.load();
    const net = await cocossd.load();
    
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      // e.g. const obj = await net.detect(video);
      const arr = await net.detect(video);

      const kim = arr.find(obj => obj.class === "dog" || obj.class === "teddy bear");
      const couch = arr.find(obj => ["couch", "chair", "person", "bed"].includes(obj.class));

      const getX = (obj) => obj.bbox[0];
      const getXRange = (obj) => getX(obj) + obj.bbox[2];
      const getY = (obj) => obj.bbox[1];
      const getYRange = (obj) => getX(obj) + obj.bbox[3];

      const kimOnCouch = (kim && couch) ? (getX(couch) < getX(kim) < getXRange(couch) && getY(couch) < getY(kim) < getYRange(couch)) : false;

      couch && console.log(getX(couch), getXRange(couch), getY(couch), getYRange(couch), couch.class);
      kim && console.log(getX(kim), getY(kim), kim.class);

      (kimOnCouch && !alarmActive) && setAlarmActive(true);
      (!kimOnCouch && alarmActive) && setAlarmActive(false);
      // const kimOnCouch = kim.

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  
      drawRect(arr, ctx)
    }
  };

  useEffect(()=>{runCoco()});

  useEffect(() => {
    if(alarmActive && (alarmPlayer.current.paused || alarmPlayer.current.ended)){
      alarmPlayer.current.play();
    }
  
    if(!alarmActive && !alarmPlayer.current.paused){
      alarmPlayer.current.pause();
      console.log("pausing")
      alarmPlayer.current.currentTime = 0;
    }

  })

  return (
    <div className="App">
     
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
         <audio id="alarmPlayer" ref={alarmPlayer} loop>
   <source src={alarmSound} type="audio/mpeg"/>
  </audio>
  <div className={`alert-text ${!alarmActive && "hidden" }`}>
    <h1>DOG ALERT!!!!</h1>
  </div>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
