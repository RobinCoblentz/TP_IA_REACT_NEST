import OpenAI from "openai";
import React, { useState, useEffect } from 'react';

export interface IMessage {
  username: string;
  content: string;
  timeSent: string;
  isAccurate: boolean;
}

interface Props {
  message: IMessage;
  isMe: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${month}/${day}/${year} - ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

const Message = ({ message, isMe }: Props) => {
  const [translatedMessage, setTranslatedMessage] = useState<string>('');

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true
  });  

  const translateMessage = () => {
    openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a translation system"},
        {"role": "user", "content": `Translate ${message.content} in ${sessionStorage.getItem("lang")}`}
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    })
    .then((response) => {
      console.log(response);
  
      if (response && response.choices && response.choices.length > 0) {
        const translatedText = response.choices[0]?.message.content;
        if (translatedText) {
          setTranslatedMessage(translatedText);
        } else {
          console.error('La réponse de la traduction est vide.');
        }
      } else {
        console.error('Réponse de traduction invalide.');
      }
    })
    .catch((error) => {
      console.error('Erreur lors de la traduction : ', error);
    });
  };

  return (
    <div className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-header">
        {message.username + ' ' }
        <time className="text-xs opacity-50">{formatDate(message.timeSent) + ' '}</time>
        <button onClick={translateMessage}>translate</button>
      </div>
      <div
        className={`chat-bubble ${isMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'} ${
          !message.isAccurate ? 'chat-bubble-error' : ''
        }`}
      >
        {translatedMessage || message.content}
      </div>
    </div>
  );
};

export default Message;