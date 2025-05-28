import { Message } from "../types/message";

export function readMessages(data: Buffer) {
  const raw = data.toString();
  return raw
    .split("\n")
    .filter(Boolean)
    .map((messageStr) => JSON.parse(messageStr) as Message);
}
