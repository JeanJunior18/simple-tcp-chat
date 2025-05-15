import { Socket } from "node:net";
import { Message } from "../types";
import { writeMessage } from "./write-message";

describe("write message suite", () => {
  let socket: Socket;

  beforeEach(() => {
    socket = { write: jest.fn() } as unknown as Socket;
    jest.spyOn(Date, "now").mockReturnValue(12345);
  });

  it("Should publish message on socket", () => {
    const from = "Tester da Silva";
    const type: Message["type"] = "message";
    const content = "Hello World!";

    writeMessage(socket as unknown as Socket, from, type, content);

    expect(socket.write).toHaveBeenCalledTimes(1);

    const socketWriteArg = (socket.write as jest.Mock).mock.calls[0][0];
    expect(() => JSON.parse(socketWriteArg)).not.toThrow();

    const msg = JSON.parse(socketWriteArg);
    expect(msg).toMatchObject({
      from,
      type,
      content,
      timestamp: expect.any(Number),
    });
  });

    it("should send empty string content if text is undefined", () => {
    writeMessage(socket, "Bob", "intro");
    const arg = (socket.write as jest.Mock).mock.calls[0][0];
    const msg: Message = JSON.parse(arg);
    expect(msg.content).toBe("");
  });
});
