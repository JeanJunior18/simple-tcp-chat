import net from "node:net";
import readline from "node:readline";
import os from "node:os";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const server = net.createServer((socket) => {
  socket.write("Hello Client, I am the server\n\r");
  socket.on("data", (data) => {
    console.log("Received", data.toString("utf-8"));
  });

  rl.on("line", (input) => {
    console.log("Enviando mensagem: \n>");
    socket.write(input);
  });
});

const HOST = getLocalIpAddress();
const PORT = 3000

if(!HOST) throw new Error('Ip address not found!')

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});



function getLocalIpAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface || []) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return null
}
