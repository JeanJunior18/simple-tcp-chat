import net, { Socket } from "node:net";
import readline from "node:readline";
import { getLocalIpAddress } from "./utils/ip";
import { publishService } from "./utils/bonjour";
import { Message } from "./types";
import { writeMessage } from "./utils/write-message";

// Server config
const clients: Map<string, Socket> = new Map();

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const message: Message = JSON.parse(data.toString());

    if (message.type === "intro") {
      if (clients.has(message.from)) {
        writeMessage(socket, "SERVER", "system", "Username already connected");
        console.log(`${message.from} rejected`);
      } else {
        clients.set(message.from, socket);
        console.log(`${message.from} connected`);
        writeMessage(socket, "SERVER", "message", `Bem vindo ${message.from}!`);
      }
    }

    if (message.type === "message") {
      console.log(`Mensagem de ${message.from}:`, message.content);

      clients.forEach((socket, name) => {
        if (name !== message.from) {
          socket.write(JSON.stringify(message));
        }
      });
    }
  });

  socket.on("close", () => {
    for (const [name, s] of clients.entries()) {
      if (s === socket) {
        clients.delete(name);
        console.log(`${name} desconectado`);
        break;
      }
    }
  });
});

const HOST = getLocalIpAddress();
const PORT = 3000;

if (!HOST) throw new Error("Ip address not found!");
const bonjourControl = publishService("SimpleTcpChat", PORT, HOST);

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

// Read lines config
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  console.log("Enviando mensagem: \n>");
});

const shutdown = async () => {
  console.log("Encerrando com segurança...");
  server.close();
  clients.forEach((socket) => {
    socket.end();
    socket.destroy();
  });
  await bonjourControl.stop();
};

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
