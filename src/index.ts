// An interface for standard function calls expressed as an array to avoid invocation and allow a partial function to be formed.
//    Ex: CurriedAdd(1) | [StandardAdd, 1]
type CurriedProps = Function | [Function, ...args: any[]];
type CurriedFn = ((...args: any[]) => CurriedFn) & {
  arity?: number;
  args?: number;
};
// Reusable interface for all pipe functions in MinCurryPipe
interface PipeFn {
  (...args: [CurriedProps | any, ...CurriedProps[]]): any;
}

class PipeError extends Error {
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

/* curried => Convert a function to a curried function.
            Example: 
                const StandardAdd = (a, b) => a + b;
                const StandardAdd3 = (a, b, c) => a + b + c;
                console.log(StandardAdd(1, 2)); // 3
                const CurriedAdd = curried(StandardAdd);
                console.log(CurriedAdd(1)(2)); // 3
                const CurriedAdd3 = curried(StandardAdd3);
                console.log(CurriedAdd3(1)(2,3)); // 6
    */
const curried = (fn: Function): CurriedFn => {
  const arity = fn.length;
  const curry = (...argsList: any[]) => {
    const args = argsList.length;

    if (args > arity) throw new PipeError(null, fn?.name, arity, args);

    if (args == arity && typeof fn == "function") return fn(...argsList);

    const nextCurry = (...nextArgs: any[]) => curry(...nextArgs, ...argsList);
    Object.defineProperty(nextCurry, "name", { value: `partial_${fn.name}` });
    Object.assign(nextCurry, { arity, args });

    return new Proxy(nextCurry, {
      apply(target, thisArg, argArray) {
        if (args + argArray.length - 1 > arity)
          throw new PipeError(null, fn?.name, arity, args + argArray.length);
        return Reflect.apply(target, thisArg, argArray);
      },
    });
  };

  Object.defineProperty(curry, "name", { value: `curried_${fn.name}` });
  Object.assign(curry, { arity });

  return curry as CurriedFn;
};

const curryAll = (list: any[]) => {
  const isStandardFunction = (v) =>
    Array.isArray(v) && typeof v[0] === "function";
  const isProperArity = (v) => v.length === v[0].length;
  return list.map((v) => {
    if (isStandardFunction(v) && isProperArity(v)) {
      const [fn, ...args] = v;
      return curried(fn)(...args);
    } else if (isStandardFunction(v) && !isProperArity(v))
      throw new PipeError(null, v[0]?.name, v[0]?.length, v?.length - 1);
    return v;
  });
};

const asyncTryFn = (fn, v) => {
  try {
    const res = v?.then ? (async () => fn(await v))() : fn(v);
    if (typeof res === "function")
      throw new PipeError(null, fn?.name, fn?.arity, fn?.args);
    return res;
  } catch (e) {
    throw new PipeError(null, fn?.name, fn?.arity, fn?.args);
  }
};

/* pipeArg => Pipe an object or value through a series of curried functions.
            Example:
                const StandardAdd = (a, b) => a + b;
                const StandardAdd3 = (a, b, c) => a + b + c;
                const CurriedAdd = (a) => (b) => a + b;
                const AltCurriedAdd = curried(StandardAdd);
                const CurriedAdd3 = curried(StandardAdd3);
  
                const result = pipeArg(
                    1,
                    CurriedAdd(2),
                    AltCurriedAdd(3)
                    CurriedAdd3(4, 5)
                ); // 15
  
                const errorResult = pipe(1, StandardAdd(1)) // Error
    */
const pipeArg: PipeFn = (initialValue: any, ...fns: CurriedFn[]) =>
  fns.reduce((acc, fn, i) => {
    if (typeof fn != "function") {
      fn = fns
        .slice(0, i)
        .reverse()
        .find((f) => typeof f == "function");
      throw new PipeError(null, fn?.name, fn?.arity, null);
    }
    return asyncTryFn(fn, acc);
  }, initialValue);

/* pipeFns => Pipe a series of curried functions together.
            Example:
                const StandardAdd = (a, b) => a + b;

                const CurriedAdd = (a) => (b) => a + b;
                const AltCurriedAdd = curried(StandardAdd);
  
                const RunPipe = pipeFns(
                    CurriedAdd(2),
                    AltCurriedAdd(3)
                ); 
                const result = RunPipe(1); // 6
  
                const ErrorPipe = pipeFns(StandardAdd(1), StandardAdd(1)) 
                const errorResult = ErrorPipe(1) // Error
    */
const pipeFns: PipeFn = (...fns: Function[]) => {
  const newFn = (x: any) => fns.reduce((v, f) => asyncTryFn(f, v), x);
  Object.defineProperty(newFn, "name", {
    value: `pipe(${fns.map((f) => f.name).join(", ")})`,
  });
  return newFn;
};

/* pipe => Dynamically pipeFns or pipeArg */
const pipe: PipeFn = (...args: [any, ...Function[]]) => {
  const [firstArg, ...fns] = curryAll(args);
  const type = firstArg?.then ? "promise" : typeof firstArg;

  if (type == "promise") return (async () => pipeArg(await firstArg, ...fns))();
  else if (type == "function") return pipeFns(firstArg, ...fns);
  else return pipeArg(firstArg, ...fns);
};

export type { PipeFn, CurriedProps, CurriedFn };
export { pipe, curried, PipeError };
