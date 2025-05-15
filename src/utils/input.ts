import { createRl } from "./rl";

export function input(question: string): Promise<string> {
  const rl = createRl();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
