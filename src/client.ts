import net from "node:net";
import readline from "node:readline";

const client = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const HOST = "172.29.50.42"
const PORT = 3000

client.connect(PORT, HOST, function () {
  console.log("Client connected");
  client.write("Hello server! I am listening!");
});

client.on("data", function (data) {
  console.log("Message received: ", data.toString("utf-8"));
});

client.on("close", function () {
  console.log("Connection closed");
});

rl.on("line", (input) => {
  console.log("Enviando mensagem: \n>");
  client.write(input);
});
