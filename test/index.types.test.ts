import { expectType } from "tsd";
import { curried, CurriedFn, pipe } from "../src";
import { AnyFn } from "../src/types";

const myFn = (a: number, b: string, c: boolean, d: object) => {
  const args = [a, b, c, d];
  const types = ["number", "string", "boolean", "object"];
  args.forEach((arg, i) => {
    if (typeof arg != types[i]) throw `Expected ${types[i]}. Got ${arg}.`;
  });
  return a;
};
type MyFnT = typeof myFn;
const curriedFn = curried(myFn);
type CurriedFnT = typeof curriedFn;

const myFn2 = (a: boolean, b: string, c: boolean, d: object) => 1

const ExpectError = (fn: AnyFn) => {
  let noError;
  try {
    fn();
    noError = true;
  } catch {}
  if (noError) throw `Expected error. None thrown.`;
};

describe("curried", () => {
  it("returns a generically typed curried function", () => {
    expectType<CurriedFn<MyFnT>>({} as CurriedFnT);
  });

  it("parses nested partial types", () => {
    const partialFn = curriedFn(true, {});
    const nestedPartialFn = partialFn("");
    const result = nestedPartialFn(1);

    expectType<
      ((p_0: string) => (p_0: number) => number) &
        ((p_0: number, p_1: string) => number)
    >({} as typeof partialFn);

    expectType<(p_0: number) => number>({} as typeof nestedPartialFn);

    expectType<number>({} as typeof result);
    expect(result).toBe(1);
  });

  it("allows block args in partials", () => {
    const partialFn = curriedFn({});
    const nestedPartialFn = partialFn("", true);
    const result = nestedPartialFn(1);

    expectType<
      ((
        p_0: boolean
      ) => ((p_0: string) => (p_0: number) => number) &
        ((p_0: number, p_1: string) => number)) &
        ((p_0: string, p_1: boolean) => (p_0: number) => number) &
        ((p_0: number, p_1: string, p_2: boolean) => number)
    >({} as typeof partialFn);

    expectType<(p_0: number) => number>({} as typeof nestedPartialFn);

    expectType<number>({} as typeof result);
    expect(result).toBe(1);
  });

  it("provides arg errors for incorrect or out-of-order arg types", () => {
    const partialFn = curriedFn(true, {});
    const nestedPartialFn = partialFn("");
    const result = nestedPartialFn(1);

    //@ts-expect-error
    curriedFn(1, "");

    ExpectError(() => {
      //@ts-expect-error
      expectError(nestedPartialFn(true));
    });

    ExpectError(() => {
      //@ts-expect-error
      result();
    });
  });

  it("works with args and returns assigned to any", () => {
    const anyFn = (a, b, c, d) => a + b + c + d;
    const curriedAnyFn = curried(anyFn);
    const partialFn = curriedAnyFn("Arg D");
    const nestedPartialFn = partialFn(1, 2);
    const result = nestedPartialFn("Arg A");

    expectType<
      ((
        p_0: any
      ) => ((
        p_0: any
      ) => ((p_0: any) => (p_0: any) => any) & ((p_0: any, p_1: any) => any)) &
        ((p_0: any, p_1: any) => (p_0: any) => any) &
        ((p_0: any, p_1: any, p_2: any) => any)) &
        ((
          p_0: any,
          p_1: any
        ) => ((p_0: any) => (p_0: any) => any) &
          ((p_0: any, p_1: any) => any)) &
        ((p_0: any, p_1: any, p_2: any) => (p_0: any) => any) &
        ((p_0: any, p_1: any, p_2: any, p_3: any) => any)
    >({} as typeof curriedAnyFn);

    expectType<(p_0: any) => any>({} as typeof nestedPartialFn);
    expectType<any>({} as typeof result);
  });
});

describe("pipe", () => {
  it("interperets functions as arrays and detects arg errors", () => {
    

    pipe(1, [myFn, "2", true, {}] as const)
    //@ts-expect-error
    pipe(1, [myFn, "2", true, 1] as const)

    pipe(1, [myFn, "2", true, {}] as const, [myFn, "2", true, {}] as const)
    //@ts-expect-error
    pipe(1, [myFn, "2", true, {}] as const, [myFn2,  true, {}] as const)
  });
});
