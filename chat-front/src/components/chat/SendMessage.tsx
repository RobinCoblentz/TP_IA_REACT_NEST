"use client";
import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  username: string;
}

const SendMessage = ({ socket, username }: Props) => {
  const [text, setText] = useState("");


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-message", {
      username,
      content: text,
      timeSent: new Date().toISOString(),
    });

    setText("");
  };
  return (
  <footer className="sticky bottom-0 ">
    <form onSubmit={handleSubmit} className="items-center justify-center">
      <input type="text" value={text} className="input input-bordered input-primary w-full max-w-xs m-3" onChange={(e) => setText(e.target.value) }/> 
      <button className="btn btn-primary m-3">Send</button>
    </form>
  </footer>
   
  );
};

export default SendMessage;
