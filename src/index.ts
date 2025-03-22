import PipeError from "./pipe_error";
import { AnyFn, CurriedFn, ValidatePipeFns, PipeSim } from "./types";
// An interface for standard function calls expressed as an array to avoid invocation and allow a partial function to be formed.
//    Ex: CurriedAdd(1) | [StandardAdd, 1]
type CurriedProps = Function | [Function, ...args: any[]];

// Reusable interface for all pipe functions in MinCurryPipe
interface PipeFn {
  (...args: [CurriedProps | any, ...CurriedProps[]]): any;
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
const curried = <Fn extends AnyFn>(fn: Fn): CurriedFn<Fn> => {
  const arity = fn.length;
  const curry: CurriedFn<AnyFn> = (...argsList: any[]) => {
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

  return curry as CurriedFn<Fn>;
};

const curryAll = (list: any[]) => {
  const isStandardFunction = (v) =>
    Array.isArray(v) && typeof v[0] === "function";
  const isProperArity = (v) => v.length === v[0].length;
  return list.map((v) => {
    if (isStandardFunction(v) && isProperArity(v)) {
      const [fn, ...args] = v;
      return (curried(fn) as CurriedFn<AnyFn>)(...args);
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
const pipeArg = <const T extends readonly (unknown[] | AnyFn)[], F extends any>(
  ...[initialValue, ...fns]: [F, ...ValidatePipeFns<T, F>]
) =>
  fns.reduce((acc, fn, i) => {
    if (typeof fn != "function") {
      fn = fns
        .slice(0, i)
        .reverse()
        .find((f) => typeof f == "function");
      //@ts-ignore
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
const pipeFns = <const T extends readonly (unknown[] | AnyFn)[]>(
  ...fns: [...PipeSim<T>]
) => {
  const newFn = (x: any) => fns.reduce((v, f) => asyncTryFn(f, v), x);
  Object.defineProperty(newFn, "name", {
    // @ts-ignore
    value: `pipe(${fns.map((f) => f.name).join(", ")})`,
  });
  return newFn;
};

/* pipe => Dynamically pipeFns or pipeArg */
const pipe = <const T extends readonly (unknown[] | AnyFn)[], F extends any>(
  ...[F, ...P]: [F, ...ValidatePipeFns<T, F>]
) => {
  const [firstArg, ...fns] = curryAll([F, ...P]);
  const type = firstArg?.then ? "promise" : typeof firstArg;

  if (type == "promise") return (async () => pipeArg(await firstArg, ...fns))();
  else if (type == "function") return pipeFns(firstArg, ...fns);
  else return pipeArg(firstArg, ...fns);
};

export type { PipeFn, CurriedProps, CurriedFn };
export { pipe, curried, PipeError };
