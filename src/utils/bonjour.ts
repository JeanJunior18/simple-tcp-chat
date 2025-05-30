import bonjour from "bonjour";

interface BonjourService {
  name: string;
  type: string;
  port: number;
  host?: string;
  [key: string]: any;
}

let bonjourInstance: bonjour.Bonjour | null = null;

try {
  bonjourInstance = bonjour();
} catch (error) {
  console.error("❌ Failed to initialize Bonjour:", error);
}

export function publishService(name: string, port: number, host?: string) {
  if (!bonjourInstance) {
    console.warn("⚠️ Bonjour not available, cannot publish service");
    return { stop: () => Promise.resolve() };
  }

  let service: bonjour.Service | null = null;
  try {
    service = bonjourInstance.publish({
      name,
      type: "chat",
      port,
      host,
    });
    console.log(`📡 Serviço "${name}" publicado via Bonjour`);
  } catch (error) {
    console.error("❌ Failed to publish service:", error);
    return { stop: () => Promise.resolve() };
  }

  return {
    stop: () =>
      new Promise<void>((resolve) => {
        console.log("🛑 Encerrando serviço Bonjour...");
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            console.warn(
              "⚠️ Timeout ao encerrar o Bonjour. Forçando encerramento..."
            );
            if (bonjourInstance) bonjourInstance.destroy();
            resolved = true;
            resolve();
          }
        }, 2000);

        if (service) {
          service.stop(function () {
            if (!resolved) {
              clearTimeout(timeout);
              if (bonjourInstance) bonjourInstance.destroy();
              resolved = true;
              resolve();
            }
          });
        } else {
          clearTimeout(timeout);
          resolved = true;
          resolve();
        }
      }),
  };
}

export function findService(
  type: string = "chat",
  timeoutMs: number = 5000
): Promise<BonjourService> {
  return new Promise((resolve, reject) => {
    let instance: bonjour.Bonjour | null = null;
    try {
      instance = bonjour();
      console.log("🔍 Buscando servidor via Bonjour");
    } catch (error) {
      console.error("❌ Failed to initialize Bonjour for findService:", error);
      reject(new Error("❌ Bonjour not available"));
      return;
    }

    const timeout = setTimeout(() => {
      if (instance) instance.destroy();
      reject(
        new Error("⏱️ Timeout: serviço não encontrado dentro do tempo limite")
      );
    }, timeoutMs);

    instance.findOne({ type }, (service: BonjourService) => {
      clearTimeout(timeout);
      if (instance) instance.destroy();
      if (service) {
        console.log("🔍 Serviço encontrado via Bonjour");
        resolve(service);
      } else {
        reject(new Error("❌ Serviço não encontrado"));
      }
    });
  });
}
