import bonjour from "bonjour";
import { findService, publishService } from "./bonjour";

describe("publishService()", () => {
  it("should call bonjour().publish and return stop method", async () => {
    const stopMock = jest.fn((cb) => cb && cb());
    const destroyMock = jest.fn();

    const publishMock = jest.fn().mockReturnValue({
      stop: stopMock,
    });

    const bonjourMockInstance = {
      publish: publishMock,
      destroy: destroyMock,
    };

    (bonjour as unknown as jest.Mock).mockReturnValue(bonjourMockInstance);

    const result = publishService("TestService", 1234, "localhost");

    await result.stop();

    expect(publishMock).toHaveBeenCalledWith({
      name: "TestService",
      type: "chat",
      port: 1234,
      host: "localhost",
    });
    expect(stopMock).toHaveBeenCalled();
    expect(destroyMock).toHaveBeenCalled();
  });

  it("should find and return a service", async () => {
    const destroyMock = jest.fn();

    const findOneMock = jest.fn((_opts, cb) => {
      cb({ name: "ChatService" });
    });

    const bonjourMockInstance = {
      findOne: findOneMock,
      destroy: destroyMock,
    };

    (bonjour as unknown as jest.Mock).mockReturnValue(bonjourMockInstance);

    const service = await findService();

    expect(service).toEqual({ name: "ChatService" });
    expect(destroyMock).toHaveBeenCalled();
  });
});
