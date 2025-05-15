import net, { Socket } from "node:net";
import readline from "node:readline";
import { getLocalIpAddress } from "./utils/ip";
import { publishService } from "./utils/bonjour";

// Server config
let currentSocket: Socket;

const server = net.createServer((socket) => {
  currentSocket = socket;
  socket.write("Hello Client, I am the server\n\r");
  socket.on("data", (data) => {
    console.log("Received", data.toString("utf-8"));
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
  currentSocket.write(input);
});

const shutdown = async () => {
  console.log("Encerrando com segurança...");
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
