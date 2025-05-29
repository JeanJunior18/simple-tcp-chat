import "./InputMessage.css";
import { useState } from "react";

interface InputMessageProps {
  username: string | null;
  onSetUsername: (username: string) => void;
  disabled: boolean;
}

function InputMessage({ username, onSetUsername, disabled }: InputMessageProps) {
  const [input, setInput] = useState("");
  const [tempUsername, setTempUsername] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed) {
      window.api.sendMessage(trimmed);
      setInput("");
    }
  };

  const handleSetUsername = () => {
    const trimmed = tempUsername.trim();
    if (trimmed) {
      onSetUsername(trimmed);
      window.api.setUsername?.(trimmed);
    }
  };

  if (!username) {
    return (
      <div className="input-area username-input">
        <input
          type="text"
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
          placeholder="Escolha um nome de usuário"
          onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
        />
        <button onClick={handleSetUsername}>Entrar no Chat</button>
      </div>
    );
  }

  return (
    <div className="input-area">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite sua mensagem..."
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
      />
      <button onClick={handleSend} disabled={disabled}>Enviar</button>
    </div>
  );
}

export default InputMessage;
