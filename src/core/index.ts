import { TcpChatNode } from "./TcpChat";
import crypto from "crypto";

(async () => {
  const hash = crypto.randomBytes(5);
  const chatCore = new TcpChatNode();
  await chatCore.start(`Guest ${hash}`);
})();
