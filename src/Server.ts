import { Socket, Server, createServer } from "node:net";
import { Message } from "./types";
import { writeMessage } from "./utils/write-message";

export class TCPChatServer {
  private clients: Map<string, Socket> = new Map();
  private server: Server;
  private username!: string;

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

  private handleConnection(socket: Socket) {
    socket.on("data", (data) => this.onMessage(socket, data));
    socket.on("close", () => this.onClose(socket));
  }

  private onMessage(socket: Socket, data: Buffer<ArrayBufferLike>) {
    try {
      const message: Message = JSON.parse(data.toString());

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

        this.clients.forEach((socket, name) => {
          if (name !== message.from) {
            writeMessage(socket, message.from, message.type, message.content);
          }
        });
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
