import bonjour, { RemoteService } from "bonjour";

let bonjourInstance: ReturnType<typeof bonjour> | null = null;

export function publishService(name: string, port: number, host: string) {
  bonjourInstance = bonjour();
  const service = bonjourInstance.publish({
    name,
    type: "chat",
    port,
    host,
  });

  console.log(`📡 Serviço "${name}" publicado via Bonjour`);

  return {
    stop: () =>
      new Promise<void>((resolve) => {
        console.log("🛑 Encerrando serviço Bonjour...");

        let resolved = false;

        // Fallback: força a resolução depois de 2 segundos
        const timeout = setTimeout(() => {
          if (!resolved) {
            console.warn(
              "⚠️ Timeout ao encerrar o Bonjour. Forçando encerramento..."
            );
            bonjourInstance?.destroy();
            resolved = true;
            resolve();
          }
        }, 2000);

        service?.stop(() => {
          if (!resolved) {
            clearTimeout(timeout);
            bonjourInstance?.destroy();
            resolved = true;
            resolve();
          }
        });
      }),
  };
}

export function findService(type = "chat", timeoutMs = 5000): Promise<RemoteService> {
  return new Promise((resolve, reject) => {
    const instance = bonjour();
    console.log("🔍 Buscando servidor via Bonjour");

    const timeout = setTimeout(() => {
      instance.destroy();
      reject(new Error("⏱️ Timeout: serviço não encontrado dentro do tempo limite"));
    }, timeoutMs);
    
    instance.findOne({ type }, (service) => {
      clearTimeout(timeout); // limpa o timeout se encontrar antes
      instance.destroy();
      if (service) {
        console.log("🔍 Serviço encontrado via Bonjour");
        resolve(service);
      } else {
        reject(new Error("❌ Serviço não encontrado"));
      }
    });
  });
}

