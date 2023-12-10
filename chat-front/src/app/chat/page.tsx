"use client";
import Messages from "@/components/chat/Messages";
import SendMessage from "@/components/chat/SendMessage";
import Username from "@/components/chat/Username";
import Prediction from "@/components/chat/Prediction";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [pred, setPred] = useState([]);

  useEffect(() => {
 
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.once("messages-old", (data) => {
      setMessages((msg) => [...msg, ...data] as any);
    });

    socket.on("chat-message", (data) => {
      setMessages((msg) => [...msg, data] as any);
    }); 
  
    socket.on("chat-prediction", (data) => {
      setPred(data);
    });
  }, []);
  

  return (
    <div>
      {username === "" ? (
        <Username socket={socket} setUsername={setUsername} />
      ) : (
        <div>
          <div>
            <Messages messages={messages} username={username} />
          </div>
          <div className="sticky bottom-0 ">
          <Prediction socket={socket} username={username} preds={pred}/>
          <SendMessage socket={socket} username={username} />
          </div>
          
        
        </div>
      )}
    </div>
  );
};

export default Chat;
