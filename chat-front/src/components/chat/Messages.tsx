import React, { useEffect, useRef } from "react";
import Message, { IMessage } from "./Message";

interface Props {
  messages: IMessage[];
  username: string;
}

const Messages = ({ messages, username }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>
          <Message message={msg} isMe={msg.username === username} />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
