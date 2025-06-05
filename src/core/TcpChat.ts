import { TCPChatClient } from "./Client";
import { TCPChatServer } from "./Server";
import { findService, publishService } from "../utils/bonjour";
import { getLocalIpAddress } from "../utils/ip";
import { Message } from "../types/message";
import { generateRandomNumber } from "../utils/random";

export class TcpChatNode {
  private client?: TCPChatClient;
  private server?: TCPChatServer;
  private bonjourControl?: Awaited<ReturnType<typeof publishService>>;
  private isServer = false;
  private onMessageCallback?: (msg: Message) => void;
  private onConnectCallback?: (username: string) => void;
  private onErrorCallback?: (error: any) => void;

  async start(username: string) {
    try {
      await this.connectAsClient(username);
    } catch {
      try {
        await this.connectAsHost(username);
      } catch (err) {
        if (this.onErrorCallback && err instanceof Error) {
          this.onErrorCallback(err);
        }
        try {
          await this.connectAsClient(username);
        } catch (err2) {
          if (this.onErrorCallback && err2 instanceof Error) {
            this.onErrorCallback(err2);
          }
          throw err2;
        }
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
    this.onMessageCallback = callback;

    if (this.client) {
      this.client.onMessage(callback);
    }

    if (this.server) {
      this.server.onMessage(callback);
    }
  }

  onConnect(callback: (username: string) => void) {
    this.onConnectCallback = callback;

    if (this.client) {
      this.client.onConnect(callback);
    }

    if (this.server) {
      this.server.onConnect(callback);
    }
  }

  onError(callback: (err: Error) => void) {
    this.onErrorCallback = callback;
  }

  private async connectAsClient(username: string) {
    const timeOut = generateRandomNumber(2000, 5000);
    const service = await findService("chat", timeOut);
    console.log("Servidor já existe. Entrando como cliente...");
    if (!service.host) throw new Error("HOST is required");
    this.client = new TCPChatClient(service.host, service.port);
    await this.client.start(username);

    if (this.handleReconnection) {
      this.client.onDisconnect(() => this.handleReconnection(username));
    }
    if (this.onMessageCallback) {
      this.client.onMessage(this.onMessageCallback);
    }
    if (this.onConnectCallback) {
      this.client.onConnect(this.onConnectCallback);
    }
  }

  private async connectAsHost(username: string) {
    console.log("Nenhum servidor encontrado. Inicializando como servidor...");
    this.isServer = true;
    const HOST = getLocalIpAddress();
    if (!HOST) throw new Error("Host not found");
    const PORT = 3000;
    this.server = new TCPChatServer(HOST, PORT);
    await this.server.start(username);
    this.bonjourControl = publishService("TcpChat", PORT, HOST);

    if (this.onMessageCallback) {
      this.server.onMessage(this.onMessageCallback);
    }
    if (this.onConnectCallback) {
      this.server.onConnect(this.onConnectCallback);
    }
  }

  private async handleReconnection(username: string) {
    this.client = undefined;
    this.isServer = false;

    try {
      this.onErrorCallback?.({ status: "DISCONNECTED" });
      await this.connectAsClient(username);
      console.log("Reconectado como cliente.");
    } catch {
      console.log(
        "Nenhum servidor encontrado. Assumindo como novo servidor..."
      );
      try {
        await this.connectAsHost(username);
        console.log("Promovido a servidor.");
      } catch (err) {
        console.error("Erro ao tentar virar servidor:", err);
        setTimeout(() => this.handleReconnection(username), 3000);
      }
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
