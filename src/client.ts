import net, { Socket } from "node:net";
import { findService } from "./utils/bonjour";
import { input } from "./utils/input";
import { writeMessage } from "./utils/write-message";
import { Message } from "./types";
import { Interface } from "node:readline";
import { createRl } from "./utils/rl";

let client: Socket;
let username: string;
const rl = createRl();

findService()
  .then(async (service) => {
    username = await input("Qual é o seu nome? ");
    connectClient(service.port, service.host, username, rl);
  })
  .catch((err) => {
    console.log("Server not found", err);
  });

export function connectClient(
  port: number,
  host: string,
  username: string,
  rl: Interface
) {
  client = new net.Socket();

  client.connect(port, host, function () {
    console.log("Connected!");
    writeMessage(client, username, "intro");
    console.log("Envie uma mensagem:");
    rl.on("line", (line) => {
      if (line.trim() === "/sair" || line.trim() === "/exit") {
        shutdown();
      } else {
        writeMessage(client, username, "message", line);
      }
    });
  });

  client.on("data", function (data) {
    const message: Message = JSON.parse(data.toString());
    const time = new Date(message.timestamp).toLocaleTimeString();
    console.log(`[${time}] ${message.from}: ${message.content}`);
  });

  client.on("close", function () {
    console.log("Connection closed");
    process.exit();
  });
}

function shutdown() {
  console.log("Encerrando cliente...");
  rl.close();
  if (client) {
    client.end();
    client.destroy();
  }
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGQUIT", shutdown);
process.on("uncaughtException", (err) => {
  console.error("Erro não tratado:", err);
  shutdown();
});
process.on("unhandledRejection", (reason) => {
  console.error("Rejeição de promessa:", reason);
  shutdown();
});
