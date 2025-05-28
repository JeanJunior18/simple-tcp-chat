import { TCPChatClient } from "./Client";
import { TCPChatServer } from "./Server";
import { findService, publishService } from "../utils/bonjour";
import { getLocalIpAddress } from "../utils/ip";

export class TcpChatNode {
  private client?: TCPChatClient;
  private server?: TCPChatServer;
  private bonjourControl?: Awaited<ReturnType<typeof publishService>>;
  private username = "Jean";
  private isServer = false;

  async start() {
    try {
      const service = await findService();
      console.log("Servidor já existe. Entrando como cliente...");
      this.client = new TCPChatClient(service.host, service.port);
      await this.client.start(this.username);
      this.client.sendTextMessage("Olá! Acabei de entrar no chat.");
    } catch {
      console.log("Nenhum servidor encontrado. Inicializando como servidor...");
      this.isServer = true;
      const HOST = getLocalIpAddress();
      if (!HOST) throw new Error("Host not found");
      const PORT = 3000;
      this.server = new TCPChatServer(HOST, PORT);
      await this.server.start(`HOST - ${this.username}`)
      this.bonjourControl = publishService("TcpChat", PORT, HOST);
    }

    this.setupShutdownHooks();
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
