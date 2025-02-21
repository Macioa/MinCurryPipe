import { pipe as basePipe } from "./";

interface PipeWarmerObj {
  onStep: Function;
  faultSafe: Function;
  pipe: Function;
}

const newPipeWarmer = () => {
  const warmer = {
    onStep: (...newStepFns) => addOnStep(warmer, ...newStepFns),
    pipe: basePipe,
    faultSafe: () => addFaultSafe(warmer),
  } as PipeWarmerObj;
  return warmer;
};

/* onStep => Apply operations to each step in pipe
            Example:
                const StandardAdd = (a, b) => a + b;

                onStep((
                  (result, target, index) => console.log("PipeLog: ", {result, index, target})
                )).pipe(
                  1,
                  [add, 3],
                  [add, 5]
                )

                // PipeLog: {result: 1, index: 0, target: 1}
                // PipeLog: {result: 4, index: 1, target: [function add]} 
                // PipeLog: {result: 9, index: 2, target: [function add]} 
*/

const onStep = (
  ...stepFns: ((result: any, target: any, index: number) => void)[]
) => addOnStep(newPipeWarmer(), ...stepFns);

/* faultSafe => Suppress errors to allow computation or logging for partially completed pipes.
            Example:
                const StandardAdd = (a, b) => a + b;

                onStep((
                  (result, target, index) => console.log("PipeLog: ", {result, index, target})
                ))
                .faultSafe()
                .pipe(
                  1,
                  [add, 3],
                  [add, 5],
                  (...args) => throw "ERROR! Does not compute!",
                  [add, 7]
                )

                // PipeLog: {result: 1, index: 0, target: 1}
                // PipeLog: {result: 4, index: 1, target: [function add]} 
                // PipeLog: {result: 9, index: 2, target: [function add]} 
*/

const faultSafe = () => addFaultSafe(newPipeWarmer());

const addFaultSafe = (pipeWarmer: PipeWarmerObj) => {
  const { pipe } = pipeWarmer;
  pipeWarmer.pipe = new Proxy(pipe, {
    apply(target, thisArg, argArray) {
      try {
        return Reflect.apply(target, thisArg, argArray);
      } catch {}
    },
  });
  return pipeWarmer;
};

const addOnStep = (...args: [PipeWarmerObj, ...Function[]]) => {
  const [pipeWarmer, ...stepFns] = args;
  const { pipe } = pipeWarmer;
  pipeWarmer.pipe = new Proxy(pipe, {
    apply(target, thisArg, argArray) {
      const proxiedArgs = argArray.map((fn, i) => {
        if (typeof fn === "function") {
          return new Proxy(fn, {
            apply(target, thisArg, argArray) {
              const result = Reflect.apply(target, thisArg, argArray);
              stepFns.forEach((stepFn) => stepFn(result, target, i));
              return result;
            },
          });
        } else {
          stepFns.forEach((stepFn) => stepFn(fn, fn, i));
          return fn;
        }
      });
      return Reflect.apply(target, thisArg, proxiedArgs);
    },
  });
  return pipeWarmer;
};

export { onStep, faultSafe };
