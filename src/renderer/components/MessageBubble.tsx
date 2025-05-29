import './MessageBubble.css'
import { Message } from "types/message";
import { formatTime } from "utils/time";

interface MessageProps {
  message: Message
}

function MessageBubble({ message }: MessageProps) {
  let className = "message";
  if (message.type === "intro") className += " intro";
  else if (message.type === "system") className += " system";

  return (
    <div className={className}>
      <div className="meta">
        <strong>{message.from}</strong> <span>{formatTime(message.timestamp)}</span>
      </div>
      <div className="content">{message.content}</div>
    </div>
  );
};

export default MessageBubble