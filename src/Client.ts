import { Socket } from "node:net";
import { findService } from "./utils/bonjour";
import { writeMessage } from "./utils/write-message";
import { Message } from "./types";

export class TCPChatClient {
  private socket!: Socket;
  private username!: string;
  private isConnected = false;

  constructor(private readonly host: string, private readonly port = 3000) {}

  async start(username: string) {
    try {
      this.username = username;
      await this.connect(this.port, this.host);
    } catch (err) {
      console.error("Server not Found", err);
    }
  }

  sendTextMessage(text: string) {
    if (!this.isConnected) {
      console.warn("Cliente não está conectado");
      return;
    }

    writeMessage(this.socket, this.username, "message", text);
  }

  shutdown() {
    console.log("Encerrando cliente...");
    if (this.socket) {
      this.socket.end();
      this.socket.destroy();
    }
    process.exit();
  }

  private async connect(port: number, host: string) {
    console.log("Conectando!");
    return new Promise((res, rej) => {
      this.socket = new Socket();

      this.socket.connect(port, host, () => {
        console.log("Connected!");
        this.isConnected = true;
        writeMessage(this.socket, this.username, "intro");
        res(this.socket);
      });

      this.socket.on("data", this.onMessage);

      this.socket.on("close", () => {
        console.log("Connection closed");
        process.exit();
      });

      this.socket.on("error", (err) => {
        console.error("Error: ", err);
        rej();
      });

      this.socket.on("timeout", () => {
        console.warn("Server timeout");
        rej();
      });
    });
  }

  private onMessage(data: Buffer<ArrayBufferLike>) {
    try {
      const message: Message = JSON.parse(data.toString());
      const time = new Date(message.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${message.from}: ${message.content}`);
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  }
}
