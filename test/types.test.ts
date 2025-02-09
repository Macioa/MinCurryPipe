import { expectType } from "tsd";
import {
  AnyFn,
  Take,
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
    type R1 = Take<[1, 2], [1, 2, 3, 4]>;
    expectType<R1>({} as [3, 4]);
    type R2 = Take<[1, 2, 3, 4], [1, 2]>;
    expectType<R2>({} as []);
    type R3 = Take<[1, 2], [1, 2]>;
    expectType<R3>({} as []);
    type R4 = Take<[1, 2], [3, 4]>;
    expectType<R4>({} as [3, 4]);
    type R5 = Take<[1, 2, 3], [3, 4, 5]>;
    expectType<R5>({} as never);
    type R6 = Take<[1, 2, 4], [1, 2, 3, 4, 5]>;
    expectType<R6>({} as never);
    type R7 = Take<[], [1, 2, 3]>;
    expectType<R7>({} as [1, 2, 3]);
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
  });
});

describe("InterperetCurried", () => {
  it("matches curried function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn>;
    expectType<R1>({} as (p_0: number, b?: string, c?: boolean) => AnyFn);
    expectType<R1>({} as InterperetCurried<typeof myFn>);
  });
  it("provides partials when usedArgs provided", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, [1]>;
    expectType<R1>(
      {} as (
        p_0: string,
        c?: boolean | undefined
      ) => string | ((p: boolean) => string)
    );
    type R2 = InterperetCurried<typeof myFn, [1, "2"]>;
    expectType<R2>({} as (p: boolean) => string);
  });
  it("provides fn return when usedArgs > fnArgs", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, [1, "2", true]>;
    expectType<R1>({} as string);
    type R2 = InterperetCurried<typeof myFn, [1, "2", true, 1]>;
    expectType<R2>({} as never);
  });
  it("does not provide fn return when usedArgs < fnArgs", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, ["1"]>;
    expectType<R1>({} as never);
    type R2 = InterperetCurried<typeof myFn, [1, 1]>;
    expectType<R2>({} as never);
  });
  it("uses next args appropriately", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = InterperetCurried<typeof myFn, [1], ["2"]>;
    expectType<(p: boolean) => string>({} as R1);
    type R2 = InterperetCurried<typeof myFn, [1, "2"], [true]>;
    expectType<string>({} as R2);
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
    expectType<R2>({} as true);
    type R3 = IsFnAsArray<[typeof myFn, 1, "2"]>;
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
    type R4 = CurriedReturnType<CurriedFn<typeof myFn, [1]>>;
    expectType<R4>({} as string);
  });
});

describe("ArrayToCurried", () => {
  it("converts an array to a curried function", () => {
    const myFn = (a: number, b: string, c: boolean): string => a + b + c;
    type R1 = ArrayToCurried<[typeof myFn, 1, "2"]>;
    expectType<R1>({} as (p: boolean) => string);
    type R2 = ArrayToCurried<[typeof myFn, 1, "2", true]>;
    expectType<R2>({} as string);
    type R3 = ArrayToCurried<[typeof myFn, 1, "2", true, 1]>;
    expectType<R3>({} as never);
    type R4 = ArrayToCurried<[typeof myFn, 1]>;
    expectType<R4>(
      {} as ((
        p_0: string,
        c?: boolean | undefined
      ) => string | ((p: boolean) => string)) & {
        name?: string;
        parentFn?: AnyFn;
        arity?: number;
        args?: number;
      }
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
    type R3 = PropToCurried<[typeof myFn, 1, "2"]>;
    expectType<R3>(
      {} as ((p: boolean) => string) & {
        name?: string;
        parentFn?: AnyFn;
        arity?: number;
        args?: number;
      }
    );
  });
});
