interface PipeFn {
  (...args: [any, ...Function[]]): any;
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

const curried = (fn: Function) => {
  const curry = (...args: any[]) =>
    args.length >= fn.length
      ? fn(...args)
      : (...nextArgs: any[]) => curry(...args, ...nextArgs);
  return curry;
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
const pipeArg: PipeFn = (initialValue: any, ...fns: Function[]) =>
  fns.reduce((acc, fn) => {
    return acc.then ? (async () => fn(await acc))() : fn(acc);
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
const pipeFns: PipeFn =
  (...fns: Function[]) =>
  (x: any) =>
    fns.reduce((v, f) => (v.then ? (async () => f(await v))() : f(v)), x);

/* pipe => Dynamically pipeFns or pipeArg */
const pipe: PipeFn = (...args: [any, ...Function[]]) => {
  const [firstArg, ...fns] = args;
  const type = firstArg?.then ? "promise" : typeof firstArg;

  if (type == "promise") return (async () => pipeArg(await firstArg, ...fns))();
  else if (type == "function") return pipeFns(firstArg, ...fns);
  else return pipeArg(firstArg, ...fns);
};

export type { PipeFn };
export { pipe, curried };
