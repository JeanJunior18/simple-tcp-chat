import { Socket } from "node:net";
import { writeMessage } from "../utils/write-message";
import { Message } from "../types/message";
import { readMessages } from "../utils/read-messages";

export class TCPChatClient {
  private socket!: Socket;
  private username!: string;
  private isConnected = false;
  private messageCallback?: (msg: Message) => void;

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

  onMessage(callback: (msg: Message) => void) {
    this.messageCallback = callback;
  }

  private async connect(port: number, host: string) {
    console.log("Conectando!");
    return new Promise((res, rej) => {
      this.socket = new Socket();

      this.socket.connect(port, host);

      this.socket.on("connect", () => {
        this.isConnected = true;
        writeMessage(this.socket, this.username, "intro");
        res(this.socket);
      });

      this.socket.on("data", (data) => {
        const messages = readMessages(data);
        messages.forEach((message) => {
          this.handleIncomingMessage(message);
        });
      });

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

  private handleIncomingMessage(message: Message) {
    try {
      const time = new Date(message.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${message.from}: ${message.content}`);

      if (this.messageCallback) {
        this.messageCallback(message);
      }
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  }
}
