import { NEVER, FALSE } from "ts-neverfalse";
import { IsError, IsFalse } from "ts-neverfalse/error";
import { Marked } from "ts-neverfalse/interface";

type AnyFn = (...args: any[]) => any;

type FnAsArray = readonly [AnyFn, ...args: any[]];

type PipeProp = CurriedFn<AnyFn> | FnAsArray;

type Take<NegArr extends any[], FromArr extends any[]> = NegArr extends [
  infer FirstNA,
  ...infer RestNA
]
  ? FromArr extends [infer FirstFA, ...infer RestFA]
    ? FirstNA extends FirstFA
      ? Take<RestNA, RestFA>
      : FALSE<
          { FirstNA; FirstFA },
          `Expected (${ToString<FirstFA>}). Got (${ToString<FirstNA>}).`
        >
    : []
  : FromArr;

type TakeLast<NegArr extends any[], FromArr extends any[]> = Take<
  Reverse<NegArr>,
  Reverse<FromArr>
> extends infer Res
  ? IsError<Res> extends false
    ? Reverse<List<Res>>
    : Res
  : NEVER<{ NegArr; FromArr }, "Could not run Take operation">;

type IsAny<T> = 0 extends 1 & T ? true : false;

type Reverse<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : [];

type List<T> = T extends any[] ? T : [T];

type InterperetCurried<
  Fn extends AnyFn,
  UsedArgs extends any[] = [],
  Intersect extends boolean = true
> = Fn extends (...p: infer FnArgs) => infer FnRes
  ? { RemArgs: TakeLast<UsedArgs, FnArgs> } extends {
      RemArgs: infer RemArgs;
    }
    ? IsError<RemArgs> extends true
      ? RemArgs
      : RemArgs extends []
      ? FnRes
      : MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>, Intersect>
    : NEVER<{ UsedArgs; FnArgs }, "Could not calc RemArgs">
  : FALSE<Fn, "Fn doesn't extend AnyFn">;

type MapArgsToCurriedFns<
  Fn extends AnyFn,
  SplitArgsList extends any[],
  Intersect extends boolean = true
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
        ? Intersect extends true
          ? MapArgsToCurriedFns<Fn, RestA> & ((...p: List<UsedArgs>) => FnRes)
          : MapArgsToCurriedFns<Fn, RestA> | ((...p: List<UsedArgs>) => FnRes)
        : Intersect extends true
        ? MapArgsToCurriedFns<Fn, RestA> &
            ((
              ...p: List<UsedArgs>
            ) => MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>)
        :
            | MapArgsToCurriedFns<Fn, RestA>
            | ((
                ...p: List<UsedArgs>
              ) => MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>)
      : First
    : FALSE<SplitArgsList, "ArgList is not an array of length 1 or more">
  : FALSE<Fn, "Fn is not a function">;

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
  UsedArgs extends any[] = [],
  Intersect extends boolean = true
> = InterperetCurried<Fn, UsedArgs, Intersect> extends infer Curried
  ? IsError<Curried> extends false
    ? Curried & {
        name?: string;
        parentFn?: AnyFn;
        arity?: number;
        args?: number;
      }
    : Curried
  : NEVER<{ Fn; UsedArgs }, "Could not infer Curried">;

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

type IsFnAsArray<T extends any> = T extends readonly [
  infer Fn,
  ...infer ProvidedArgs
]
  ? Fn extends (...args: infer FnArgs) => any
    ? {
        RevProvided: Reverse<ProvidedArgs>;
        RevFnArgs: Reverse<FnArgs>;
      } extends { RevProvided: infer RevProvided; RevFnArgs: infer RevFnArgs }
      ? RevProvided extends Partial<RevFnArgs>
        ? T
        : FALSE<
            ProvidedArgs,
            `Args must be a trailing subset of FnArgs. Expected (${ToString<
              List<RevFnArgs>[0]
            >}). Received (${ToString<List<RevProvided>[0]>}).`
          >
      : NEVER<ProvidedArgs, "Could not calc RevProvided or RevFnArgs">
    : FALSE<Fn, "First arg is not a function">
  : FALSE<T, "T is not an array">;

type ArrayToCurried<
  T extends FnAsArray,
  Intersect extends boolean = true
> = T extends readonly [infer Fn, ...infer UsedArgs]
  ? Fn extends (...args: infer FnArgs) => infer FnRes
    ? UsedArgs extends FnArgs
      ? FnRes
      : CurriedFn<Fn, GetType<UsedArgs>, Intersect>
    : FALSE<Fn, "First arg is not a function">
  : FALSE<T, "T is not an array">;

type PropToCurried<T, Intersect extends boolean = true> = T extends AnyFn
  ? T
  : T extends FnAsArray
  ? IsError<IsFnAsArray<T>> extends false
    ? ArrayToCurried<T, Intersect>
    : IsFnAsArray<T>
  : FALSE<T, "T is not a Function or Function as array.">;

type ValidatePipeFns<
  T extends ReadonlyArray<AnyFn | readonly unknown[]>,
  F extends any
> = F extends AnyFn | readonly unknown[] ? PipeSim<T> : PipeSim<T, [], F>;

type PipeSim<
  T extends ReadonlyArray<AnyFn | readonly unknown[]>,
  Acc extends ReadonlyArray<readonly unknown[] | any> = readonly [],
  LastReturn extends any = null
> = T extends readonly [
  infer F extends AnyFn | readonly unknown[],
  ...infer R extends ReadonlyArray<AnyFn | readonly unknown[]>
]
  ? R extends readonly []
    ? [...Acc, EvaluateFunction<F, LastReturn>[0]]
    : EvaluateFunction<F, LastReturn> extends [infer Res, infer FnReturn]
    ? PipeSim<R, [...Acc, Res], FnReturn>
    : PipeSim<R, [...Acc, NEVER<F, "Could not validate pipe fn">], null>
  : T;

type EvaluateFunction<
  Prop extends AnyFn | readonly unknown[],
  LastReturn extends any = null
> = PropToCurried<Prop> extends (...p: infer FnArgs) => infer FnReturn
  ? LastReturn extends null
    ? [Prop, FnReturn]
    : GetType<LastReturn> extends GetType<FnArgs[0]>
    ? [Prop, FnReturn]
    : [
        FALSE<
          Prop,
          `First fn arg does not match last Fn return. Last Return: (${ToString<LastReturn>}). Next Arg: (${ToString<
            Reverse<FnArgs>[0]
          >}).`
        >,
        null
      ]
  : [IsFnAsArray<Prop>, null];

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
  Reverse,
  List,
  GetType,
  CurriedFn,
  IsCurriedFn,
  InterperetCurried,
  EvaluateFunction,
  CurriedReturnType,
  FnAsArray,
  ArrayToCurried,
  IsFnAsArray,
  PipeProp,
  PropToCurried,
  ArgSlices,
  MapArgsToCurriedFns,
  ToString,
  ValidatePipeFns,
  PipeSim
};
