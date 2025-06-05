import "./Chat.css";
import { useEffect, useRef, useState } from "react";
import { Message } from "types/message";
import MessageBubble from "renderer/components/MessageBubble";
import InputMessage from "renderer/components/InputMessage";

function SystemLog({ message }: { message: Message }) {
  return <p className="system-message">{message.content}</p>
}

function IntroLog({ message }: { message: Message }) {
  return <p className="system-message">{message.from} entrou no chat</p>
}

function MessageHandler({ message, currentUser }: { message: Message, currentUser: string | null }) {
  if (message.type === 'system')
    return <SystemLog message={message} />

  if (message.type === 'intro')
    return <IntroLog message={message} />

  if (message.type === 'message')
    return <MessageBubble message={message} currentUser={currentUser} />
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.onMessage(handleMessage);
    window.api.onConnect(handleConnect);
    window.api.onChatError(handleChatError)
  }, []);

  function handleConnect(username: string) {
    if (!isConnected) {
      console.log('Usuário conectado')
      setIsConnected(true)
    }
  }


  function handleMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
    if (msg.type === 'intro' && msg.from === username) {
      setIsConnected(true)
    }
  }

  function handleChatError(error: any) {
    console.log('Algo deu errado:', error)
    setIsConnected(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  return (
    <div className="chat-container">
      <h1>TCP Chat - {username} - {isConnected ? 'Online' : 'Offline'}</h1>

      <div className="chat-box">
        {messages.map((msg, index) => <MessageHandler key={index} message={msg} currentUser={username} />)}
        <div ref={messagesEndRef} />
      </div>

      <InputMessage
        username={username}
        onSetUsername={setUsername}
        disabled={!isConnected}
      />
    </div>
  );
}

export default Chat;
