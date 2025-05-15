import { getLocalIpAddress } from "./ip";
import os from "node:os";

describe("get ip suite", () => {
  it("should get local ip address", () => {
    jest.spyOn(os, "networkInterfaces").mockReturnValue({
      eth0: [
        { address: "127.0.0.1", family: "IPv4", internal: true },
        { address: "192.168.1.100", family: "IPv4", internal: false },
      ],
      wlan0: [{ address: "10.0.0.5", family: "IPv4", internal: false }],
    } as unknown as NodeJS.Dict<os.NetworkInterfaceInfo[]>);

    const ip = getLocalIpAddress();

    expect(ip).toBe("192.168.1.100");
  });

  it("should return null if no IPv4 non-internal address is found", () => {
    jest.spyOn(os, "networkInterfaces").mockReturnValue({
      eth0: [
        { address: "::1", family: "IPv6", internal: true },
        { address: "127.0.0.1", family: "IPv4", internal: true },
      ],
    } as unknown as NodeJS.Dict<os.NetworkInterfaceInfo[]>);

    const ip = getLocalIpAddress();
    expect(ip).toBeNull();
  });

  it("should handle interfaces being undefined or empty", () => {
    jest.spyOn(os, "networkInterfaces").mockReturnValue({});

    expect(getLocalIpAddress()).toBeNull();

    jest.spyOn(os, "networkInterfaces").mockReturnValue({
      eth0: undefined,
    });

    expect(getLocalIpAddress()).toBeNull();
  });
});
