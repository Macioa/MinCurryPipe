type DEBUG_MODE = false;

type AnyFn = (...args: any[]) => any;
type DebugNever<
  E extends string,
  Args extends any = []
> = DEBUG_MODE extends true ? `DEBUG_NEVER: ${E}, ${ToString<Args>}` : never;
type _DebugFalse<
  E extends string,
  Args extends any = []
> = DEBUG_MODE extends true ? `DEBUG_FALSE: ${E}, ${ToString<Args>}` : false;

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
  : DebugNever<"Res doesn't extend [m,n, 'TypeError'">;

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsNever<T> = IsAny<T> extends false
  ? T | "NEVER" extends "NEVER"
    ? true
    : false
  : false;
type IsError<T> = T extends [infer Type, infer Message, infer N]
  ? [IsAny<Type>, IsAny<Message>, IsAny<N>] extends [false, false, false]
    ? IsNever<N> extends true
      ? true
      : false
    : false
  : false;

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
    : DebugNever<"Could not calc RemArgs">
  : DebugNever<"Fn doesn't extend AnyFn">;

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
      : DebugNever<"FirstArg doesn't extend [RemA, ...UsedA]", First>
    : DebugNever<"ArgList doesn't extend [F, ...R]", SplitArgsList>
  : DebugNever<"Fn doesn't extend AnyFn", Fn>;

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
    : false
  : false;

type IsFnAsArray<T extends any> = T extends [infer Fn, ...infer ProvidedArgs]
  ? Fn extends (...args: infer FnArgs) => any
    ? {
        RevProvided: Reverse<ProvidedArgs>;
        RevFnArgs: Reverse<FnArgs>;
      } extends { RevProvided: infer RevProvided; RevFnArgs: infer RevFnArgs }
      ? RevProvided extends Partial<RevFnArgs>
        ? RevFnArgs extends Partial<RevProvided>
          ? RevProvided extends RevFnArgs
            ? false
            : false
          : true
        : false
      : false
    : false
  : false;

type ArrayToCurried<T extends FnAsArray> = T extends [
  infer Fn,
  ...infer UsedArgs
]
  ? Fn extends (...args: infer FnArgs) => infer FnRes
    ? UsedArgs extends FnArgs
      ? FnRes
      : CurriedFn<Fn, GetType<UsedArgs>>
    : DebugNever<"UsedArgs doesnt extend FnArgs">
  : DebugNever<"Fn doesn't extend AnyFn">;

type PropToCurried<T> = T extends FnAsArray
  ? IsFnAsArray<T> extends true
    ? ArrayToCurried<T>
    : DebugNever<"T is not FnAsArray">
  : IsCurriedFn<T> extends true
  ? T
  : DebugNever<"T is not curriedFn or FnAsArray">;

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

type PipeFunctions<Funcs extends AnyFn[]> = {
  [Func of Funcs]: 
}

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
