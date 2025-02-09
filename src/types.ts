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
      : [FirstFA, ...Take<NegArr, RestFA>]
    : []
  : FromArr;

type List<T> = T extends any[] ? T : [T];

type CurriedFn<Fn extends AnyFn, Args extends any[] = []> = InterperetCurried<
  Fn,
  Args
> & {
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

type InterperetCurried<
  Fn extends AnyFn,
  UsedArgs extends any[] = [],
  NextArgs extends any[] = []
> = Fn extends (...p: infer FnArgs) => infer FnRes
  ? {
      UsedArgsT: GetType<UsedArgs>;
      NextArgsT: GetType<NextArgs>;
    } extends { UsedArgsT: infer UsedArgsT; NextArgsT: infer NextArgsT }
    ? {
        RemainingArgs: Take<[...List<UsedArgsT>, ...List<NextArgsT>], FnArgs>;
      } extends {
        RemainingArgs: infer RemainingArgs;
      }
      ? RemainingArgs extends []
        ? FnRes
        : RemainingArgs extends [infer FirstRA, ...infer RestRA]
        ? RestRA extends []
          ? (p: FirstRA) => FnRes
          : (
              ...p: [FirstRA, ...Partial<RestRA>]
            ) =>
              | InterperetCurried<
                  Fn,
                  [...List<UsedArgsT>, ...List<NextArgsT>],
                  [FirstRA]
                >
              | FnRes
        : never
      : never
    : never
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
