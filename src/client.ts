import net from "net";
import readline from "readline";

const client = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

client.connect(3000, "127.0.0.1", function () {
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
