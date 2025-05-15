jest.mock("node:readline", () => {
  return {
    createInterface: jest.fn(() => ({
      question: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
    })),
  };
});

jest.mock("bonjour", () => {
  return jest.fn(() => ({
    // @ts-ignore
    findOne: (_opts, cb) => {
      setTimeout(
        () => cb({ name: "mock-service", port: 1234, host: "localhost" }),
        10
      );
    },
    destroy: jest.fn(),
    publish: jest.fn(() => ({
      // @ts-ignore
      stop: (cb) => cb(),
    })),
  }));
});
