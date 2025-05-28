import { Message } from "types/message";

export {};

declare global {
  interface Window {
    api: {
      sendMessage: (msg: string) => void;
      onMessage: (callback: (msg: Message) => void) => void;
    };
  }
}
