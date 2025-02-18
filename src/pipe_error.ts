export default class PipeError extends Error {
  constructor(
    message: string = null,
    name: string = null,
    arity: number | string = null,
    args: number | string = null
  ) {
    args = typeof args == "number" ? args + 1 : args;
    const arityS = arity ? `Expected(${arity})` : "";
    const argsS = arity && args ? `, Received(${args})` : "";
    const m = [
      message || "Function failed in pipe:",
      name || "",
      `${arityS}${argsS}`,
    ].join("\n\t");
    super(m);
    this.name = "PipeError";
    const stack = this.stack.split("\n");
    const newStack = [...stack.slice(0, 3), ...stack.slice(-2)].join("\n");
    Object.defineProperty(this, "stack", {
      value: newStack,
      writable: true,
      configurable: true,
    });
  }
}