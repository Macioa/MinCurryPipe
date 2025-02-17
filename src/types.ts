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
  : never;

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
    ? RemArgs extends ["TypeError", ...infer error]
      ? ["TypeError", ...error]
      : RemArgs extends []
      ? FnRes
      : MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>
    : never
  : never;

type MapArgsToCurriedFns<
  Fn extends AnyFn,
  SplitArgsList extends any[]
> = Fn extends (...p: infer _FnArgs) => infer FnRes
  ? SplitArgsList extends [infer First, ...infer RestA]
    ? First extends [infer RemArgs, infer UsedArgs]
      ? UsedArgs extends []
        ? MapArgsToCurriedFns<Fn, RestA> | ((...p: List<RemArgs>) => FnRes)
        :
            | MapArgsToCurriedFns<Fn, RestA>
            | ((
                ...p: List<UsedArgs>
              ) => MapArgsToCurriedFns<Fn, ArgSlices<List<RemArgs>>>)
      : never
    : never
  : never;

type ArgSlices<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [[[...T], []], ...ArgSlicesInner<[First], Rest>]
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
    ? ProvidedArgs extends Partial<FnArgs>
      ? FnArgs extends Partial<ProvidedArgs>
        ? ProvidedArgs extends FnArgs
          ? false
          : false
        : true
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
    : never
  : never;

type PropToCurried<T> = T extends FnAsArray
  ? IsFnAsArray<T> extends true
    ? ArrayToCurried<T>
    : never
  : IsCurriedFn<T> extends true
  ? T
  : never;

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
