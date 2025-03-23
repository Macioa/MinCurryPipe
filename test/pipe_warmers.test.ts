import { curried, pipe, onStep, faultSafe } from "../src";

describe("onStep", () => {
  it("calls a function in each step of the pipe", () => {
    const StandardAdd = (a, b, c) => a + b + c,
      CurriedAdd = curried(StandardAdd),
      cache = {};

    const RunPipe = onStep(
      (result, target, index) => (cache[index] = { result, target })
    ).pipe(CurriedAdd(2, 3), CurriedAdd(4)(5), CurriedAdd(6, 7));

    RunPipe(1);
    expect(cache).toMatchObject({
      "0": {
        result: 6,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
      "1": {
        result: 15,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
      "2": {
        result: 28,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
    });
  });

  it("calls a function in each step of the pipe when pipe args are expressed as arrays", () => {
    const StandardAdd = (a, b, c) => a + b + c,
      cache = {};

    const RunPipe = onStep(
      (result, target, index) => (cache[index] = { result, target })
    ).pipe([StandardAdd, 2, 3], [StandardAdd, 4, 5], [StandardAdd, 6, 7]);

    RunPipe(1);
    expect(cache).toMatchObject({
      "0": {
        result: 6,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
      "1": {
        result: 15,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
      "2": {
        result: 28,
        //   target: [Function: partial_StandardAdd] { arity: 3, args: 2 }
      },
    });
  });

  it("allows multiple onSteps and persists through faultSafe", () => {
    const r1: any[] = [],
      r2: any[] = [],
      r3: any[] = [];

    onStep(
      (result, target, index) => r1.push(result),
      (result, _t, _i) => r2.push(result)
    )
      .faultSafe()
      .onStep((result, _t, _i) => r3.push(result))
      .pipe(
        1,
        (x) => x + 3,
        (x) => x + 5
      );

    expect(r1).toStrictEqual([1, 4, 9]);
    expect(r2).toStrictEqual([1, 4, 9]);
    expect(r3).toStrictEqual([1, 4, 9]);
  });
});

describe("faultSafe", () => {
  it("suppresses errors", () => {
    faultSafe().pipe(1, (x) => {
      throw "Error!";
    });

    expect(true).toBeTruthy();
  });
});

describe("doc test", () => {
  it("does what it says", () => {
    const cache = {};
    const StandardAdd = (a, b) => a + b;

    onStep((result, target, index) => (cache[index] = { result, target }))
      .faultSafe()
      .pipe(1, [StandardAdd, 2], [StandardAdd, 3], [StandardAdd, 4]);

    expect(cache).toMatchObject({
      "0": { result: 1, target: 1 },
      "1": { result: 3 },
      "2": { result: 6 },
      "3": { result: 10 },
    });
  });
});

