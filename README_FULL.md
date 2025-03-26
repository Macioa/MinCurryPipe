# MinCurryPipe

Minimal curry and dynamic pipe

## Installation and usage

##### install:

```bash
npm install mincurrypipe
```

##### import:

```js
import { curried, pipe } from "mincurrypipe";
```

```js
const { curried, pipe } = require("mincurrypipe");
```

## curried

#### Convert a function to a curried function.

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;
const StandardAdd3 = (a, b, c) => a + b + c;
```

##### use:

```js
const CurriedAdd = curried(StandardAdd);
CurriedAdd(1)(2); // 3
```

```js
const CurriedAdd3 = curried(StandardAdd3);
CurriedAdd3(1)(2, 3); // 6
CurriedAdd3(1)(2)(3); // 6
```

## pipe argument

#### Pipe an object or value through a series of curried functions.

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;
const StandardAdd3 = (a, b, c) => a + b + c;

const CurriedAdd = (a) => (b) => a + b;
const AltCurriedAdd = curried(StandardAdd);
const CurriedAdd3 = curried(StandardAdd3);
```

##### use:

```js
const result = pipe(
    1,
    CurriedAdd(2),
    AltCurriedAdd(3)
    CurriedAdd3(4, 5)
); // 15
```

##### avoid:

```js
const errorResult = pipe(1, StandardAdd(1)); // Error
```

## pipe functions

#### Pipe a series of curried functions together.

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;

const CurriedAdd = (a) => (b) => a + b;
const AltCurriedAdd = curried(StandardAdd);
```

##### use:

```js
const PipedFunction = pipe(CurriedAdd(2), AltCurriedAdd(3)); // Function
const result = PipedFunction(1); // 6
```

##### avoid:

```js
const ErrorPipe = pipe(StandardAdd(1), StandardAdd(1)); // Function
const errorResult = ErrorPipe(1); // Error
```

## async pipes

#### Pipe a promise as an argument or use curried async functions.

#### Example:

##### with:

```js
const PromisedValue = (v) => Promise.resolve(v);
const StandardAdd = (a, b) => a + b;
const AsyncAdd = (a, b) => Promise.resolve(a + b);

const CurriedAdd = curried(StandardAdd);
const CurriedAsyncAdd = (a) => (b) => Promise.resolve(a + b);
const AltCurriedAsyncAdd = curried(AsyncAdd);
```

##### use:

```js
const PromiseOne = PromisedValue(1); // Promise
const result = pipe(PromiseOne, CurriedAdd(2)); // Promise
await result; // 3
```

```js
const result = pipe(1, CurriedAsyncAdd(2), AltCurriedAsyncAdd(3)); // Promise
await result; // 6
```

```js
const PipedFunction = pipe(CurriedAsyncAdd(2), AltCurriedAsyncAdd(3)); // Function
const result = PipedFunction(1); // Promise
await result; // 6
```

## auto curry

#### Pass standard functions and their partial arguments as arrays to avoid immediate invocation and allow piping

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;
```

##### use:

```js
const result = pipe(1, [StandardAdd, 2], [StandardAdd, 3]); // 6
const RunPipe = pipe([StandardAdd, 2], [StandardAdd, 3]); // Function
RunPipe(1); // 6
```

## function naming

#### When using the curried function or auto conversion, generated curried and partial functions will be named curried_ORIGINALFN or partial_ORIGINALFN

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;
const CurriedAdd = curried(StandardAdd);
const AddOne = CurriedAdd(1);
```

##### use:

```js
console.log(CurriedAdd); // [Function curried_StandardAdd] {arity: 2}
console.log(AddOne); // [Function partial_StandardAdd] {arity: 2, args: 1}
```

## error handling

#### When using the curried or pipe functions, error messages are provided to show where functions failed.

#### Example:

##### with:

```js
const StandardAdd = (a, b) => a + b;
```

##### use:

```js
pipe(1, [StandardAdd, 2, 3]);
/*
PipeError: Function failed in pipe:
        StandardAdd3
        Expected(3), Received(2)
*/
```

## pipe warmers

#### Closure functions to alter the pipe behavior without altering the pipe itself

    * onStep -> Provide a function to be called after each function in the pipe
    * faultSafe -> Suppress errors, allowing access to the last successful result.

#### Example:

##### with:

```js
const cache = {}
const StandardAdd = (a, b) => a + b;
```

##### use:

```js
onStep((result, target, index) => (cache[index] = { result, target }))
  .faultSafe()
  .pipe(1, [StandardAdd, 2], [StandardAdd, 3], [StandardAdd, 4]);
console.log(cache);
/*{
      "0": { result: 1, target: 1 },
      "1": { result: 3 },
      "2": { result: 6 },
      "3": { result: 10 },
    }*/
```
