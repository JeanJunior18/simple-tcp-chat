import readline from "node:readline";
import { stdin, stdout } from "node:process";
import { TcpChatNode } from "./TcpChat";
import crypto from "crypto";

(async () => {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const hash = crypto.createHash("sha256").digest("hex");
  const chatCore = new TcpChatNode();
  await chatCore.start(`Guest ${hash}`);

  rl.on("line", (input) => {
    chatCore.sendTextMessage(input);
  });
})();
