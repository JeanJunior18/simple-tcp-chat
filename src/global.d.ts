import { Message } from "types/message";

export {};

declare global {
  interface Window {
    api: {
      sendMessage: (msg: string) => void;
      onMessage: (callback: (msg: Message) => void) => void;
      setUsername: (username: string) => void;
      onConnect: (callback: (username: string) => void) => void;
      onChatError: (callback: (data: any) => void) => void;
    };
  }
}
