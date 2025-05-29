import "./Chat.css";
import { useEffect, useRef, useState } from "react";
import { Message } from "types/message";
import MessageBubble from "renderer/components/MessageBubble";
import InputMessage from "renderer/components/InputMessage";

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.onMessage((msg: Message) => {
      console.log("NEW MESSAGE", msg);
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  return (
    <div className="chat-container">
      <h1>TCP Chat</h1>
      <div className="chat-box">
        {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>
      <InputMessage
        username={username}
        onSetUsername={setUsername}
        disabled={!username}
      />
    </div>
  );
}

export default Chat;
