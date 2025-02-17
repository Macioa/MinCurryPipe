import { expectType } from "tsd";
import { CurriedFn } from "../src/types";

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsUnknown<T> = unknown extends T
  ? T extends unknown
    ? true
    : false
  : false;

type IsAnyOrUnknown<T> = IsAny<T> extends true
  ? true
  : IsUnknown<T> extends true
  ? true
  : false;

// When TS fails to compute the type, it will return `any` | `unknown` as the type or error on the type instantiation
test("CurriedFn type calculates all possible arg combinations for function with 10 args ", () => {
  type R1 = CurriedFn<_10ParamFunc>;
  type R2 = IsAnyOrUnknown<R1>;
  expectType<R2>({} as false);
});
test("CurriedFn type calculates all possible arg combinations for function with 20 args ", () => {
  type R1 = CurriedFn<_20ParamFunc>;
  type R2 = IsAnyOrUnknown<R1>;
  expectType<R2>({} as false);
});
test("CurriedFn type calculates all possible arg combinations for function with 40 args ", () => {
  type R1 = CurriedFn<_40ParamFunc>;
  type R2 = IsAnyOrUnknown<R1>;
  expectType<R2>({} as false);
});
// test("CurriedFn type calculates all possible arg combinations for function with 60 args ", () => {
//   type R1 = CurriedFn<_60ParamFunc>;
//   type R2 = IsAnyOrUnknown<R1>;
//   expectType<R2>({} as false);
// });

type _60ParamFunc = (
  a: number,
  b: string,
  c: boolean,
  d: object,
  a0: number,
  b0: string,
  c0: boolean,
  d0: object,
  a1: number,
  b1: string,
  c1: boolean,
  d1: object,
  a2: number,
  b2: string,
  c2: boolean,
  d2: object,
  a3: number,
  b3: string,
  c3: boolean,
  d3: object,
  a4: number,
  b4: string,
  c4: boolean,
  d4: object,
  a5: number,
  b5: string,
  c5: boolean,
  d5: object,
  a6: number,
  b6: string,
  c6: boolean,
  d6: object,
  a7: number,
  b7: string,
  c7: boolean,
  d7: object,
  a8: number,
  b8: string,
  c8: boolean,
  d8: object,
  a9: number,
  b9: string,
  c9: boolean,
  d9: object,
  a10: number,
  b10: string,
  c10: boolean,
  d10: object,
  a11: number,
  b11: string,
  c11: boolean,
  d11: object,
  a12: number,
  b12: string,
  c12: boolean,
  d12: object,
  a13: number,
  b13: string,
  c13: boolean,
  d13: object,
  a14: number,
  b14: string,
  c14: boolean,
  d14: object
) => string;

type _40ParamFunc = (
  a: number,
  b: string,
  c: boolean,
  d: object,
  a0: number,
  b0: string,
  c0: boolean,
  d0: object,
  a1: number,
  b1: string,
  c1: boolean,
  d1: object,
  a2: number,
  b2: string,
  c2: boolean,
  d2: object,
  a3: number,
  b3: string,
  c3: boolean,
  d3: object,
  a4: number,
  b4: string,
  c4: boolean,
  d4: object,
  a5: number,
  b5: string,
  c5: boolean,
  d5: object,
  a6: number,
  b6: string,
  c6: boolean,
  d6: object,
  a7: number,
  b7: string,
  c7: boolean,
  d7: object,
  a8: number,
  b8: string,
  c8: boolean,
  d8: object,
  a9: number,
  b9: string,
  c9: boolean,
  d9: object
) => string;

type _20ParamFunc = (
  a: number,
  b: string,
  c: boolean,
  d: object,
  a0: number,
  b0: string,
  c0: boolean,
  d0: object,
  a1: number,
  b1: string,
  c1: boolean,
  d1: object,
  a2: number,
  b2: string,
  c2: boolean,
  d2: object,
  a3: number,
  b3: string,
  c3: boolean,
  d3: object
) => string;

type _10ParamFunc = (
  a: number,
  b: string,
  c: boolean,
  d: object,
  a0: number,
  b0: string,
  c0: boolean,
  d0: object,
  a1: number,
  b1: string
) => string;
