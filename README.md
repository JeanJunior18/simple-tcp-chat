# 💬 Simple Chat TCP

- [x] O usuário deve ser capaz de comunicar com outros usuários através de um chat peer-to-peer **sem internet**, apenas em uma **rede local (LAN)**

- [x] O servidor deve ser capaz de identificar o próprio host e logar ao iniciar, para que seja possível acessar de outros dispositivos na rede

- [x] O cliente deve ser capaz de encontrar o servidor automaticamente através do bonjour

- [x] O Cliente deve informar o seu nome para o servidor antes de se conectar

- [x] O servidor deve ser capaz de se conectar a múltiplos clientes

- [ ] Resolver bug do encerramento seguro

- [ ] Rodar tudo na mesma aplicação e eleger o primeiro para ser o servidor e os demais serem clientes

## 🔜 Ideias para futuras melhorias

- [ ] Substituir o Bonjour por descoberta via **UDP Broadcast** puro
- [ ] Criar uma interface CLI mais amigável com mensagens coloridas e timestamps
- [ ] Implementar reconexão automática do cliente em caso de queda

---

## 🧠 Objetivo

- Criar um **servidor TCP** que aceite conexões em uma porta fixa.
- Criar um **cliente TCP** que se conecta ao servidor via IP local.
- Permitir **troca de mensagens** simples entre cliente e servidor via terminal.

---

## 🧩 Arquitetura

```plaintext
┌────────────────────────┐
│     Máquina A (Host)   │
│  IP: 192.168.0.10      │
│                        │
│ ┌────────────────────┐ │
│ │ TCP Server (Node.js) │◄───────┐
│ └────────────────────┘ │        │
└────────────────────────┘        │
                                  │   Mensagens via TCP
┌────────────────────────┐        │
│     Máquina B (Client) │        │
│  IP: 192.168.0.11      │        │
│                        │        │
│ ┌────────────────────┐ │        │
│ │ TCP Client (Node.js) ├───────►┘
│ └────────────────────┘ │
└────────────────────────┘
```

# 🚀 Como testar

1. Clone o repositório e instale dependências
```bash
git clone https://github.com/JeanJunior18/simple-tcp-chat
cd simple-chat-tcp
npm install
```
2. Inicie o servidor em uma máquina
```bash
npm run start:server
```
3. Inicie o cliente em outra máquina (ou outro terminal)
```bash
npm run start:client
```
Certifique-se de que as máquinas estejam na mesma rede local e que você saiba o IP da máquina que roda o servidor.

# ⚙️ Tecnologias utilizadas
Node.js – ambiente de execução

TypeScript – tipagem e organização

Módulo net do Node.js – comunicação TCP

readline – entrada do usuário via terminal

## 🛠 Limitações atuais
Apenas um cliente por vez

IP do servidor deve ser informado manualmente

Sem criptografia ou autenticação

Terminal como única interface

