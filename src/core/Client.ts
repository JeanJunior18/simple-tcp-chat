import { Socket } from "node:net";
import { writeMessage } from "../utils/write-message";
import { Message } from "../types/message";
import { readMessages } from "../utils/read-messages";

export class TCPChatClient {
  private socket!: Socket;
  private username!: string;
  private isConnected = false;

  private messageCallback?: (msg: Message) => void;
  private connectCallback?: (username: string) => void;
  private onDisconnectCallback?: () => void;

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
    // process.exit();
  }

  onMessage(callback: (msg: Message) => void) {
    this.messageCallback = callback;
  }

  onConnect(callback: (username: string) => void) {
    this.connectCallback = callback;
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  private async connect(port: number, host: string) {
    return new Promise((res, rej) => {
      this.socket = new Socket();

      this.socket.connect(port, host);

      this.socket.on("connect", () => {
        this.isConnected = true;
        res(this.socket);
        writeMessage(this.socket, this.username, "intro");
      });

      this.socket.on("data", (data) => {
        this.connectCallback?.(this.username);
        const messages = readMessages(data);

        messages.forEach((message) => {
          this.handleIncomingMessage(message);
        });
      });

      this.socket.on("close", () => {
        console.log(
          "Perdemos a conexão com o servidor. Tentando reconectar..."
        );
        this.handleDisconnection();
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

  private handleDisconnection() {
    this.socket.destroy();
    if (this.onDisconnectCallback) this.onDisconnectCallback();
  }

  private handleIncomingMessage(message: Message) {
    try {
      const time = new Date(message.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${message.from}: ${message.content}`);

      this.messageCallback?.(message);
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  }
}
