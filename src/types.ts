import { NEVER, FALSE } from "ts-neverfalse";
import { IsError } from "ts-neverfalse/error";

type AnyFn = (...args: any[]) => any;

type FnAsArray = [AnyFn, ...args: any[]];

type PipeProp = CurriedFn<AnyFn> | FnAsArray;

type Take<NegArr extends any[], FromArr extends any[]> = NegArr extends [
  infer FirstNA,
  ...infer RestNA
]
  ? FromArr extends [infer FirstFA, ...infer RestFA]
    ? FirstNA extends FirstFA
      ? Take<RestNA, RestFA>
      : [
          "TypeError",
          `Expected (${ToString<FirstFA>}). Got (${ToString<FirstNA>}).`,
          never
        ]
    : []
  : FromArr;

type TakeLast<NegArr extends any[], FromArr extends any[]> = Take<
  Reverse<NegArr>,
  Reverse<FromArr>
> extends infer Res
  ? Res extends [infer _n, infer _m, "TypeError"]
    ? Res
    : Reverse<List<Res>>
  : NEVER<{ NegArr; FromArr }, "Res doesn't extend [m,n, 'TypeError'">;

type IsAny<T> = 0 extends 1 & T ? true : false;

type Reverse<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : [];

type List<T> = T extends any[] ? T : [T];

type InterperetCurried<
  Fn extends AnyFn,
  UsedArgs extends any[] = []
> = Fn extends (...p: infer FnArgs) => infer FnRes
  ? { RemArgs: TakeLast<UsedArgs, FnArgs> } extends {
      RemArgs: infer RemArgs;
    }
    ? IsError<RemArgs> extends true // extends ["TypeError", ...infer error] // ! Matches any
      ? RemArgs
      : RemArgs extends []
      ? FnRes
      : MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>> // RemArgs | ArgSlices<List<RemArgs>>
    : NEVER<{ UsedArgs; FnArgs }, "Could not calc RemArgs">
  : NEVER<Fn, "Fn doesn't extend AnyFn">;

type MapArgsToCurriedFns<
  Fn extends AnyFn,
  SplitArgsList extends any[]
> = Fn extends (...p: infer _FnArgs) => infer FnRes
  ? SplitArgsList extends [infer First, ...infer RestA]
    ? First extends [infer RemArgs, infer UsedArgs]
      ? RestA extends []
        ? RemArgs extends []
          ? (...p: List<UsedArgs>) => FnRes
          : (
              ...p: List<UsedArgs>
            ) => MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>
        : RemArgs extends []
        ? MapArgsToCurriedFns<Fn, RestA> & ((...p: List<UsedArgs>) => FnRes)
        : MapArgsToCurriedFns<Fn, RestA> &
            ((
              ...p: List<UsedArgs>
            ) => MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>)
      : NEVER<First, "FirstArg doesn't extend [RemA, ...UsedA]">
    : NEVER<SplitArgsList, "ArgList doesn't extend [F, ...R]">
  : NEVER<Fn, "Fn doesn't extend AnyFn">;

type ArgSlices<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [[[], [...T]], ...ArgSlicesInner<[First], Rest>]
  : [];

type ArgSlicesInner<Left extends any[], Right extends any[]> = Right extends [
  infer First,
  ...infer Rest
]
  ? [[[...Left], [...Right]], ...ArgSlicesInner<[...Left, First], Rest>]
  : [];

type CurriedFn<
  Fn extends AnyFn,
  UsedArgs extends any[] = []
> = InterperetCurried<Fn, UsedArgs> & {
  name?: string;
  parentFn?: AnyFn;
  arity?: number;
  args?: number;
};

type CurriedReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends AnyFn
    ? CurriedReturnType<R>
    : R
  : T;

type IsCurriedFn<T extends any> = T extends (...args: any[]) => infer Return
  ? Return extends AnyFn
    ? true
    : FALSE<T, "Return is not a function">
  : FALSE<T, "T is not a function">;

type IsFnAsArray<T extends any> = T extends readonly [infer Fn, ...infer ProvidedArgs]
  ? Fn extends (...args: infer FnArgs) => any
    ? {
        RevProvided: Reverse<ProvidedArgs>;
        RevFnArgs: Reverse<FnArgs>;
      } extends { RevProvided: infer RevProvided; RevFnArgs: infer RevFnArgs }
      ? RevProvided extends Partial<RevFnArgs>
        ? T
        : FALSE<ProvidedArgs, "Args must be reverse subset of FnArgs">
      : NEVER<ProvidedArgs, "Could not calc RevProvided or RevFnArgs">
    : FALSE<Fn, "First arg is not a function">
  : FALSE<T, "T is not an array">;

type ArrayToCurried<T extends FnAsArray> = T extends readonly [
  infer Fn,
  ...infer UsedArgs
]
  ? Fn extends (...args: infer FnArgs) => infer FnRes
    ? UsedArgs extends FnArgs
      ? FnRes
      : CurriedFn<Fn, GetType<UsedArgs>>
    : NEVER<Fn, "First arg is not a function">
  : NEVER<T, "T is not an array">;

type PropToCurried<T> = T extends AnyFn
  ? T
  : T extends FnAsArray
  ? IsError<IsFnAsArray<T>> extends false
    ? ArrayToCurried<T>
    : NEVER<T, "Could not evaluate IsFnAsArray for T">
  : FALSE<T, "T is not a Function or Function as array.">;

type GetType<T> = T extends number
  ? number
  : T extends string
  ? string
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T extends symbol
  ? symbol
  : T extends undefined
  ? undefined
  : T extends null
  ? null
  : T extends (...args: any[]) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : T extends any[]
  ? { [K in keyof T]: GetType<T[K]> }
  : T extends object
  ? { [K in keyof T]: GetType<T[K]> }
  : T;

type ToString<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends bigint
  ? "bigint"
  : T extends symbol
  ? "symbol"
  : T extends undefined
  ? "undefined"
  : T extends null
  ? "null"
  : T extends Function
  ? "function"
  : "object";

export type {
  AnyFn,
  Take,
  TakeLast,
  List,
  GetType,
  CurriedFn,
  IsCurriedFn,
  InterperetCurried,
  CurriedReturnType,
  FnAsArray,
  ArrayToCurried,
  IsFnAsArray,
  PipeProp,
  PropToCurried,
};
