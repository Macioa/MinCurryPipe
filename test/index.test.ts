import { curried, pipe, PipeError } from "../src/index";

const Try = (fn, expectFn) => {
  try {
    expect(fn()).toThrow();
  } catch (e) {
    expectFn(e);
  }
};

test("curried returns a usable curried function", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);

  expect(CurriedAdd(1)(2, 3)).toBe(6);
  expect(CurriedAdd(1)(2)(3)).toBe(6);
});

test("curried provides named curried and partial functions", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  const PartialAdd = CurriedAdd(1);

  expect(CurriedAdd.name).toBe("curried_StandardAdd");
  expect(PartialAdd.name).toBe("partial_StandardAdd");
});

test("pipes argument through curried functions", async () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);
  const result = pipe(1, CurriedAdd(2, 3), CurriedAdd(4)(5));

  expect(result.then).toBe(undefined);
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

  expect(result.then).toBe(undefined);
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

test("pipe accepts non-curried functions passed as arrays", async () => {
  const StandardAdd = (a, b) => a + b;
  const result = pipe(1, [StandardAdd, 2]);

  expect(result.then).toBe(undefined);
  expect(result).toBe(3);
});

test("pipe provides meaningful error messages for auto curried excess arity problems", () => {
  const StandardAdd = (a, b) => a + b;
  Try(
    () => pipe(1, [StandardAdd, 2, 3]),
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("StandardAdd");
      expect(e.message).toContain("Expected(2), Received(3)");
    }
  );

  Try(
    () => {
      const RunPipe = pipe([StandardAdd, 2, 3]);
      RunPipe(1);
    },
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("StandardAdd");
      expect(e.message).toContain("Expected(2), Received(3)");
    }
  );
});

test("pipe provides meaningful error messages for auto curried insufficient arity problems", () => {
  const StandardAdd3 = (a, b, c) => a + b + c;
  Try(
    () => pipe(1, [StandardAdd3, 2]),
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("StandardAdd3");
      expect(e.message).toContain("Expected(3), Received(2)");
    }
  );

  Try(
    () => {
      const RunPipe = pipe([StandardAdd3, 2]);
      RunPipe(1);
    },
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("StandardAdd3");
      expect(e.message).toContain("Expected(3), Received(2)");
    }
  );
});

test("pipe provides meaningful error messages for manually curried excess arity problems", () => {
  const StandardAdd = (a, b, c) => a + b + c;
  const CurriedAdd = curried(StandardAdd);

  Try(
    () => pipe(1, CurriedAdd(2, 3), CurriedAdd(3, 4, 5)),
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      console.log(e.message);
      expect(e.message).toContain("StandardAdd");
      expect(e.message).toContain("Expected(3)");
    }
  );
  Try(
    () => {
      const RunPipe = pipe(CurriedAdd(2)(3, 4, 5));
      return RunPipe(1);
    },
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("StandardAdd");
      expect(e.message).toContain("Expected(3), Received(5)");
    }
  );
});

test("pipe provides meaningful error messages for manually curried insufficent arity problems", () => {
  const StandardAdd3 = (a, b, c) => a + b + c;
  const CurriedAdd3 = curried(StandardAdd3);
  Try(
    () => pipe(1, CurriedAdd3(2)),
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("partial_StandardAdd3");
      expect(e.message).toContain("Expected(3), Received(2)");
    }
  );
  Try(
    () => {
      const RunPipe = pipe(CurriedAdd3(2));
      return RunPipe(1);
    },
    (e) => {
      expect(e).toBeInstanceOf(PipeError);
      expect(e.message).toContain("partial_StandardAdd3");
      expect(e.message).toContain("Expected(3), Received(2)");
    }
  );
});
