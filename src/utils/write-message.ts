import { Socket } from "node:net";
import { Message } from "../types/message";

export function writeMessage(
  socket: Socket,
  from: string,
  type: Message["type"],
  text?: string
) {
  const message: Message = {
    from,
    content: text || "",
    type,
    timestamp: Date.now(),
  };
  socket.write(JSON.stringify(message) + "\n");
}
