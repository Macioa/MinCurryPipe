import { expectType } from "tsd";
import {
  Take,
  TakeLast,
  List,
  GetType,
  CurriedFn,
  IsCurriedFn,
  InterperetCurried,
  CurriedReturnType,
  ArrayToCurried,
  IsFnAsArray,
  PropToCurried,
} from "../src/types";

describe("Take", () => {
  it("removes matching elements in the first array from the second array", () => {
    type R1 = Take<[number, string], [number, string, boolean, object]>;
    expectType<R1>({} as [boolean, object]);
    type R2 = Take<[number, string, boolean, boolean], [number, string]>;
    expectType<R2>({} as []);
    type R3 = Take<[number, string], [number, string]>;
    expectType<R3>({} as []);
    type R4 = Take<[number, string], [boolean, boolean]>;
    expectType<R4>(
      {} as ["TypeError", "Expected (boolean). Got (number).", never]
    );
    type R5 = Take<[number, string, boolean], [boolean, boolean, bigint]>;
    expectType<R5>(
      {} as ["TypeError", "Expected (boolean). Got (number).", never]
    );
    type R6 = Take<
      [number, string, boolean],
      [number, string, object, boolean, bigint]
    >;
    expectType<R6>(
      {} as ["TypeError", "Expected (object). Got (boolean).", never]
    );
    type R7 = Take<[], [number, string, boolean]>;
    expectType<R7>({} as [number, string, boolean]);
    type R8 = Take<["a", "b"], [number, string, boolean]>;
    expectType<R8>(
      {} as ["TypeError", "Expected (number). Got (string).", never]
    );
    type R9 = Take<[number], [string, boolean]>;
    expectType<R9>(
      {} as ["TypeError", "Expected (string). Got (number).", never]
    );
    type R10 = Take<[any, any], [any, any, any]>;
    expectType<R10>({} as R10);
  });
});

describe("List", () => {
  it("forces List assignment", () => {
    type ListOrSingle = number[] | number;
    type IsArray<T> = T extends any[] ? true : false;
    expectType<boolean>({} as IsArray<ListOrSingle>);

    const v = [1, 2, 3] as ListOrSingle;
    type R2 = List<ListOrSingle>;
    expectType<true>({} as IsArray<R2>);
    expectType<true>({} as IsArray<[1]>);
    expectType<false>({} as IsArray<1>);
  });
});

describe("GetType", () => {
  it("gets the type of an array", () => {
    const myFn = (a: number, b: string, c: boolean) => a + b + c;
    type R1 = GetType<[1, 2]>;
    expectType<R1>({} as [number, number]);
    type R2 = GetType<[number, number]>;
    expectType<R2>({} as [number, number]);
    type R3 = GetType<typeof myFn>;
    expectType<R3>({} as (a: number, b: string, c: boolean) => string);
    type R4 = GetType<(a: number, b: string, c: boolean) => string>;
    expectType<R4>({} as (a: number, b: string, c: boolean) => string);
    type R5 = GetType<any>;
    expectType<R5>({} as any);
  });
});

describe("InterperetCurried", () => {
  it("matches curried function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn>;
    expectType<R1>(
      {} as ((
        p_0: boolean
      ) => ((p_0: string) => (p_0: number) => string) &
        ((p_0: number, p_1: string) => string)) &
        ((p_0: string, p_1: boolean) => (p_0: number) => string) &
        ((p_0: number, p_1: string, p_2: boolean) => string)
    );
    expectType<R1>({} as InterperetCurried<typeof myFn>);
  });
  it("provides partials when usedArgs provided", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, [true]>;
    expectType<R1>(
      {} as ((p_0: string) => (p_0: number) => string) &
        ((p_0: number, p_1: string) => string)
    );
    type R2 = InterperetCurried<typeof myFn, ["2", true]>;
    expectType<R2>({} as (p_0: number) => string);
  });
  it("provides fn return when usedArgs > fnArgs", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, [1, "2", true]>;
    expectType<R1>({} as string);
  });
  it("provides meaningful type errors on arg mismatch", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;

    type R1 = InterperetCurried<typeof myFn, [1]>;
    expectType<R1>({} as never);
    type R2 = InterperetCurried<typeof myFn, [1, 1]>;
    expectType<R2>({} as never);
  });
  it("works with implied any type", () => {
    const myFn = (a, b) => `${a}:${b}`;

    type R1 = InterperetCurried<typeof myFn>;
    expectType<R1>(
      {} as ((p_0: any) => (p_0: any) => string) &
        ((p_0: any, p_1: any) => string)
    );
  });
});

describe("IsCurriedFn", () => {
  it("detects curried fns", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    const myFnCur = (a: number) => (b: string) => (c: boolean) => a + b + c;
    type R1 = IsCurriedFn<typeof myFn>;
    expectType<R1>({} as false);
    type R2 = IsCurriedFn<typeof myFnCur>;
    expectType<R2>({} as true);
    type R3 = IsCurriedFn<1>;
    expectType<R3>({} as false);
  });
});

describe("IsFnAsArray", () => {
  it("detects functions as arrays", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    const myFnArr = [typeof myFn, 1, "2"];
    type R0 = IsFnAsArray<1>;
    expectType<R0>({} as false);
    type R1 = IsFnAsArray<typeof myFn>;
    expectType<R1>({} as false);
    type R2 = IsFnAsArray<[typeof myFn, 1]>;
    expectType<R2>({} as false);
    type R3 = IsFnAsArray<[typeof myFn, "2", true]>;
    expectType<R3>({} as true);
    type R4 = IsFnAsArray<[typeof myFn, 1, "2", true, 1]>;
    expectType<R4>({} as false);
    type R5 = IsFnAsArray<[typeof myFn, 1, "2", true]>;
    expectType<R5>({} as true);
  });
});

describe("CurriedReturnType", () => {
  it("gets the return type of a curried function or standard function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    const myFnCur = (a: number) => (b: string) => (c: boolean) => a + b + c;
    type R1 = CurriedReturnType<typeof myFn>;
    expectType<R1>({} as string);
    type R2 = CurriedReturnType<typeof myFnCur>;
    expectType<R2>({} as string);
    type R3 = CurriedReturnType<CurriedFn<typeof myFn>>;
    expectType<R3>({} as string);
    type R4 = CurriedReturnType<CurriedFn<typeof myFn, [true]>>;
    expectType<R4>({} as string);
  });
});

describe("ArrayToCurried", () => {
  it("converts an array to a curried function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = ArrayToCurried<[typeof myFn, "2", true]>;
    expectType<R1>({} as (p_0: number) => string);
    type R2 = ArrayToCurried<[typeof myFn, 1, "2", true]>;
    expectType<R2>({} as string);
    type R3 = ArrayToCurried<[typeof myFn, 1, "2", true, 1]>;
    expectType<R3>(
      {} as ["TypeError", "Expected (boolean). Got (number).", never]
    );
    type R4 = ArrayToCurried<[typeof myFn, true]>;
    expectType<R4>(
      {} as ((p_0: string) => (p_0: number) => string) &
        ((p_0: number, p_1: string) => string)
    );
  });
});

describe("PropToCurried", () => {
  it("maintains a curried function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = PropToCurried<typeof myFn>;
    expectType<R1>({} as never);
    const myFnCur = (a: number) => (b: string) => (c: boolean) => a + b + c;
    type R2 = PropToCurried<typeof myFnCur>;
    expectType<R2>({} as (a: number) => (b: string) => (c: boolean) => string);
  });
  it("converts a function as array", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R3 = PropToCurried<[typeof myFn, "2", true]>;
    expectType<R3>({} as (p_0: number) => string);
  });
});
