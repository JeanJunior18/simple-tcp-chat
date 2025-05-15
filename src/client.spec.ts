import net, { Socket } from "node:net";
import { connectClient } from "./client";
import { writeMessage } from "./utils/write-message";
import { Interface } from "node:readline";

jest.mock("node:net");
jest.mock("./utils/write-message");

describe("connectClient", () => {
  let mockSocket: Socket;
  let rlMock: Partial<Interface>;

  beforeEach(() => {
    mockSocket = {
      connect: jest.fn(),
      on: jest.fn(),
      end: jest.fn(),
      destroy: jest.fn(),
    } as unknown as Socket;

    (Socket as unknown as jest.Mock).mockImplementation(() => mockSocket);

    rlMock = {
      on: jest.fn(),
      close: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should connect and set up handlers", () => {
    connectClient(1234, "localhost", "user1", rlMock as Interface);

    expect(net.Socket).toHaveBeenCalledTimes(1);
    expect(mockSocket.connect).toHaveBeenCalledWith(
      1234,
      "localhost",
      expect.any(Function)
    );
  });

  it("should call writeMessage with 'intro' on connect", () => {
    connectClient(1234, "localhost", "user1", rlMock as Interface);

    const connectCallback = (mockSocket.connect as unknown as jest.Mock).mock
      .calls[0][2];
    connectCallback();

    expect(writeMessage).toHaveBeenCalledWith(mockSocket, "user1", "intro");
  });

  it("should listen to rl line event and send message or shutdown", () => {
    connectClient(1234, "localhost", "user1", rlMock as Interface);

    const connectCallback = (mockSocket.connect as unknown as jest.Mock).mock
      .calls[0][2];
    connectCallback();

    expect(rlMock.on).toHaveBeenCalledWith("line", expect.any(Function));
    const lineCallback = (rlMock.on as jest.Mock).mock.calls[0][1];

    lineCallback("Hello");
    expect(writeMessage).toHaveBeenCalledWith(
      mockSocket,
      "user1",
      "message",
      "Hello"
    );

    const shutdownSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit mock");
    });

    expect(() => lineCallback("/sair")).toThrow("process.exit mock");
    shutdownSpy.mockRestore();
  });

  it("should handle data event and log message", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    connectClient(1234, "localhost", "user1", rlMock as Interface);

    const dataCallback = (
      mockSocket.on as unknown as jest.Mock
    ).mock.calls.find((call) => call[0] === "data")[1];

    const testMessage = JSON.stringify({
      from: "user2",
      content: "hi",
      type: "message",
      timestamp: Date.now(),
    });

    dataCallback(Buffer.from(testMessage));

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("["));

    consoleSpy.mockRestore();
  });
});
