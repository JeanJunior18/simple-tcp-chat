import { Socket, Server, createServer } from "node:net";
import { Message } from "../types/message";
import { writeMessage } from "../utils/write-message";
import { readMessages } from "../utils/read-messages";

export class TCPChatServer {
  private clients: Map<string, Socket> = new Map();
  private server: Server;
  private username!: string;
  private onMessageCallback?: (msg: Message) => void;
  private onConnectCallback?: (username: string) => void;

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

    this.onMessageCallback?.({
      content,
      from: this.username,
      timestamp: Date.now(),
      type: "message",
    });
  }

  onMessage(callback: (msg: Message) => void) {
    this.onMessageCallback = callback;
  }

  onConnect(callback: (username: string) => void) {
    this.onConnectCallback = callback;
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
      this.onMessageCallback?.(message);

      this.clients.forEach((clientSocket, name) => {
        writeMessage(clientSocket, message.from, message.type, message.content);
      });

      if (message.type === "intro") {
        if (this.clients.has(message.from)) {
          writeMessage(
            socket,
            this.username,
            "system",
            "Username already connected"
          );
          console.log(`${message.from} rejected`);
        } else {
          this.clients.set(message.from, socket);
          console.log(`${message.from} connected`);
          writeMessage(
            socket,
            this.username,
            "system",
            `${message.from} entrou no chat`
          );
          this.onConnectCallback?.(this.username);
        }
      }

      if (message.type === "message") {
        const time = new Date(message.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${message.from}: ${message.content}`);
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
