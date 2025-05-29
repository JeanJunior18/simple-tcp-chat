import './MessageBubble.css';
import { Message } from "types/message";
import { formatTime } from "utils/time";

interface MessageProps {
  message: Message;
  currentUser: string | null;
}

function MessageBubble({ message, currentUser }: MessageProps) {
  let className = "message";

  if (message.type === "intro") className += " intro";
  else if (message.type === "system") className += " system";
  else if (message.from === currentUser) className += " outgoing";
  else className += " incoming";

  return (
    <div className={className}>
      <div className="meta">
        <strong>{message.from}</strong>{" "}
        <span>{formatTime(message.timestamp)}</span>
      </div>
      <div className="content">{message.content}</div>
    </div>
  );
}

export default MessageBubble;
