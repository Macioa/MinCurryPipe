import { curried, pipe } from "../src/index";

test("curried returns a usable curried function", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  expect(CurriedAdd(1)(2, 3)).toBe(6);
  expect(CurriedAdd(1)(2)(3)).toBe(6);
});

test("pipe argument through as series of functions", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  const result = pipe(
    1, 
    CurriedAdd(2, 3),
    CurriedAdd(4)(5)
);
  expect(result).toBe(15);
});

test("pipe functions together", () => {
  const StandardAdd = (a, b, c) => a + b + c
  const CurriedAdd = curried(StandardAdd);
  const RunPipe = pipe(
    CurriedAdd(2, 3), 
    CurriedAdd(4)(5)
    );
  const result = RunPipe(1);
  expect(result).toBe(15);
});
