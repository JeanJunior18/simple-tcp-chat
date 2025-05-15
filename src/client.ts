import net from "node:net";
import readline from "node:readline";
import { findService } from "./utils/bonjour";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});



findService().then(service => {
  connectClient(service.port, service.host)
}).catch(err => {
  console.log('Server not found', err)
})


function connectClient(port: number, host: string) {
  const client = new net.Socket();

  client.connect(port, host, function () {
    console.log("Client connected");
    client.write("Hello server! I am listening!");
  });

  client.on("data", function (data) {
    console.log("Message received: ", data.toString("utf-8"));
  });

  client.on("close", function () {
    console.log("Connection closed");
    process.exit()
  });

  rl.on("line", (input) => {
    console.log("Enviando mensagem: \n>");
    client.write(input);
  });
}
