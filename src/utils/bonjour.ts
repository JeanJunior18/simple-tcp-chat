import bonjour, { RemoteService } from 'bonjour';

let bonjourInstance: ReturnType<typeof bonjour> | null = null;

export function publishService(name: string, port: number, host: string) {
  bonjourInstance = bonjour();
  const service = bonjourInstance.publish({
    name,
    type: 'chat',
    port,
    host,
  });

  console.log(`📡 Serviço "${name}" publicado via Bonjour`);

  return {
    stop: () =>
      new Promise<void>((resolve) => {
        console.log('🛑 Encerrando serviço Bonjour...');
        service.stop(() => {
          bonjourInstance?.destroy();
          resolve();
        });
      }),
  };
}


export function findService(type = 'chat'): Promise<RemoteService> {
  return new Promise((resolve, reject) => {
    const instance = bonjour();
    instance.findOne({ type }, (service) => {
      instance.destroy(); // encerrar o discover depois que achar
      if (service) {
        console.log('🔍 Serviço encontrado via Bonjour');
        resolve(service);
      } else {
        reject('Serviço não encontrado');
      }
    });
  });
}
