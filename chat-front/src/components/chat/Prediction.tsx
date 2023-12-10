"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  username: string;
  preds: string[] ;
}

const Prediction = ({ socket, username, preds }: Props) => {
  const [prediction1, setPrediction1] = useState("");
  const [prediction2, setPrediction2] = useState("");

  useEffect(() => {
    if (preds.length === 2 && preds[0] !== undefined && preds[1] !== undefined) {
      setPrediction1(preds[0]);
      setPrediction2(preds[1]);
      console.log(preds[0])

    }
  }, [preds]);

  const handlePredictionClick = (predictionId: number) => {
    const selectedPrediction = predictionId === 0 ? prediction1 : prediction2;
    if (selectedPrediction) {
      socket.emit("chat-message", {
        username,
        content: selectedPrediction,
        timeSent: new Date().toISOString(),
      });
    }
  };

  return (
    <footer className="sticky bottom-0 ">
      <button onClick={() => handlePredictionClick(0)} className="btn btn-wide m-3">
        {prediction1}
      </button>
      <button onClick={() => handlePredictionClick(1)} className="btn btn-wide m-3">
        {prediction2}
      </button>
    </footer>
  );
};

export default Prediction;