import { curried, pipe } from "../src/index";

test("curried returns a usable curried function", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  
  expect(CurriedAdd(1)(2, 3)).toBe(6);
  expect(CurriedAdd(1)(2)(3)).toBe(6);
});

test("pipes argument through curried functions", async () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  const result = pipe(1, CurriedAdd(2, 3), CurriedAdd(4)(5));

  expect (result.then).toBe(undefined);
  expect(result).toBe(15);
});

test("pipes promise argument through curried functions", async () => {
  const promise = (n) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(n), 1);
    });

  const StandardAdd = (a, b) => a + b;
  const CurriedAdd = curried(StandardAdd);

  const result = pipe(promise(1), CurriedAdd(2));

  expect(typeof result.then).toBe("function");
  expect(await result).toBe(3);
});

test("pipes argument through curried async functions", async () => {
  const StandardAdd = (a, b) => a + b;
  const AsyncAdd = (a, b) => Promise.resolve(a + b);
  const CurriedAsyncAdd = (a) => (b) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(a + b), 1);
    });
  const AltCurriedAsyncAdd = curried(AsyncAdd);

  const CurriedAdd = curried(StandardAdd);

  const result = pipe(
    1,
    CurriedAdd(2),
    CurriedAsyncAdd(3),
    CurriedAdd(4),
    AltCurriedAsyncAdd(5)
  );

  expect(typeof result.then).toBe("function");
  expect(await result).toBe(15);
});

test("pipes curried functions together", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  const RunPipe = pipe(CurriedAdd(2, 3), CurriedAdd(4)(5));

  const result = RunPipe(1);

  expect (result.then).toBe(undefined);
  expect(result).toBe(15);
});

test("pipes async functions together", async () => {
  const StandardAdd = (a, b) => a + b;
  const AsyncAdd = (a, b) => Promise.resolve(a + b);
  const CurriedAsyncAdd = (a) => (b) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(a + b), 1);
    });
  const AltCurriedAsyncAdd = curried(AsyncAdd);

  const CurriedAdd = curried(StandardAdd);
  const RunPipe = pipe(
    CurriedAsyncAdd(2),
    CurriedAdd(3),
    CurriedAsyncAdd(4),
    AltCurriedAsyncAdd(5)
  );
  const result = RunPipe(1);

  expect(typeof result.then).toBe("function");
  expect(await result).toBe(15);
});
