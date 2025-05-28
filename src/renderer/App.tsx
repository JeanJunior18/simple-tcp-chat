import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Message } from "types/message";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed) {
      window.api.sendMessage(trimmed);
      setInput("");
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (msg: Message, index: number) => {
    let className = "message";
    if (msg.type === "intro") className += " intro";
    else if (msg.type === "system") className += " system";

    return (
      <div key={index} className={className}>
        <div className="meta">
          <strong>{msg.from}</strong> <span>{formatTime(msg.timestamp)}</span>
        </div>
        <div className="content">{msg.content}</div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <h1>TCP Chat</h1>
      <div className="chat-box">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
