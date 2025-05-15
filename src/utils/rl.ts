import readline from "node:readline";

export function createRl() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}