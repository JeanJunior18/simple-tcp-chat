import { Socket, Server, createServer } from "node:net";
import { Message } from "../types/message";
import { writeMessage } from "../utils/write-message";
import { readMessages } from "../utils/read-messages";

export class TCPChatServer {
  private clients: Map<string, Socket> = new Map();
  private server: Server;
  private username!: string;
  private messageCallback?: (msg: Message) => void;

  constructor(private readonly host: string, private readonly port: number) {
    this.server = createServer(this.handleConnection.bind(this));
  }

  start(username: string) {
    this.username = username;
    return new Promise((res) => {
      this.server.listen(this.port, this.host, () => {
        console.log(`Server running on ${this.host}:${this.port}`);
        res(null);
      });
    });
  }

  async shutdown() {
    console.log("Encerrando com segurança...");
    this.server.close();
    this.clients.forEach((socket) => {
      socket.end();
      socket.destroy();
    });
  }

  async sendOwnTextMessage(content: string) {
    this.clients.forEach((socket) => {
      writeMessage(socket, this.username, "message", content);
    });
  }

  onMessage(callback: (msg: Message) => void) {
    this.messageCallback = callback;
  }

  private handleConnection(socket: Socket) {
    socket.on("data", (data) => {
      const messages = readMessages(data);
      messages.forEach((message) => {
        this.handleIncomingMessage(socket, message);
      });
    });
    socket.on("close", () => this.onClose(socket));
  }

  private handleIncomingMessage(socket: Socket, message: Message) {
    try {
      if (message.type === "intro") {
        if (this.clients.has(message.from)) {
          writeMessage(
            socket,
            "SERVER",
            "system",
            "Username already connected"
          );
          console.log(`${message.from} rejected`);
        } else {
          this.clients.set(message.from, socket);
          console.log(`${message.from} connected`);
          writeMessage(
            socket,
            "SERVER",
            "message",
            `Bem vindo ${message.from}!`
          );
        }
      }

      if (message.type === "message") {
        const time = new Date(message.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${message.from}: ${message.content}`);

        this.clients.forEach((clientSocket, name) => {
          writeMessage(
            clientSocket,
            message.from,
            message.type,
            message.content
          );
        });

        if (this.messageCallback) {
          this.messageCallback(message);
        }
      }
    } catch (err) {
      console.error("Erro ao processar mensagem", err);
    }
  }

  private onClose(socket: Socket) {
    for (const [name, s] of this.clients.entries()) {
      if (s === socket) {
        this.clients.delete(name);
        console.log(`${name} desconectado`);
        break;
      }
    }
  }
}
