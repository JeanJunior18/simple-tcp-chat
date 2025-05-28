import { TCPChatClient } from "./Client";
import { TCPChatServer } from "./Server";
import { findService, publishService } from "../utils/bonjour";
import { getLocalIpAddress } from "../utils/ip";
import { Message } from "../types/message";

export class TcpChatNode {
  private client?: TCPChatClient;
  private server?: TCPChatServer;
  private bonjourControl?: Awaited<ReturnType<typeof publishService>>;
  private username = "Jean";
  private isServer = false;
  private messageCallback?: (msg: Message) => void;

  async start() {
    try {
      const service = await findService();
      console.log("Servidor já existe. Entrando como cliente...");
      this.client = new TCPChatClient(service.host, service.port);
      await this.client.start(this.username);

      if (this.messageCallback) {
        this.client.onMessage(this.messageCallback);
      }

      this.client.sendTextMessage("Olá! Acabei de entrar no chat.");
    } catch {
      console.log("Nenhum servidor encontrado. Inicializando como servidor...");
      this.isServer = true;
      const HOST = getLocalIpAddress();
      if (!HOST) throw new Error("Host not found");
      const PORT = 3000;
      this.server = new TCPChatServer(HOST, PORT);
      await this.server.start(`HOST - ${this.username}`);
      this.bonjourControl = publishService("TcpChat", PORT, HOST);

      if (this.messageCallback) {
        this.server.onMessage(this.messageCallback);
      }
    }

    this.setupShutdownHooks();
  }

  async sendTextMessage(content: string) {
    if (!this.server && !this.client) throw new Error("Socket not connected!");
    if (this.isServer) {
      return this.server?.sendOwnTextMessage(content);
    }
    return this.client?.sendTextMessage(content);
  }

  onMessage(callback: (msg: Message) => void) {
    this.messageCallback = callback;

    if (this.client) {
      this.client.onMessage(callback);
    }

    if (this.server) {
      this.server.onMessage(callback);
    }
  }

  private async shutdown() {
    console.log("Desligando aplicação...");
    if (this.client) {
      this.client.shutdown?.();
    }
    if (this.server) {
      await this.server.shutdown();
    }
    if (this.bonjourControl) {
      await this.bonjourControl.stop();
    }
    process.exit();
  }

  private setupShutdownHooks() {
    const handle = () => this.shutdown();
    process.on("SIGINT", handle);
    process.on("SIGTERM", handle);
    process.on("SIGQUIT", handle);
    process.on("uncaughtException", async (err) => {
      console.error("Erro não tratado:", err);
      await this.shutdown();
    });
    process.on("unhandledRejection", async (reason) => {
      console.error("Rejeição de promessa:", reason);
      await this.shutdown();
    });
  }
}
