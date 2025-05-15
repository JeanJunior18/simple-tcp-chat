import net from "net";
import readline from "readline";

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

server.listen(3000, "127.0.0.1", () => {
  console.log("Server running on PORT 3000");
});
