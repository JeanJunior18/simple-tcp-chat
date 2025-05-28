import { TcpChatNode } from "./TcpChat";

(async () => {
  const chatCore = new TcpChatNode();
  await chatCore.start();
})();
