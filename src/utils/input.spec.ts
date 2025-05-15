import { input } from "./input";

const questionMock = jest.fn((_q: string, cb: (ans: string) => void) =>
  cb("  hello  ")
);
const closeMock = jest.fn();
const onMock = jest.fn();

jest.mock("./rl", () => ({
  createRl: jest.fn(() => ({
    question: questionMock,
    close: closeMock,
    on: onMock,
  })),
}));

describe("input function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should resolve the trimmed input", async () => {
    const result = await input("Digite algo:");
    expect(result).toBe("hello");
    expect(questionMock).toHaveBeenCalledWith("Digite algo:", expect.any(Function));
    expect(closeMock).toHaveBeenCalled();
  });
});
