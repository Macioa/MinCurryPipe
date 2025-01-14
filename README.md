# MinCurryPipe
Minimal curry and pipe

## installation and usage
```bash
npm install mincurrypipe
```
```js
import { curried, pipe } from 'mincurrypipe';
```

## curried
#### Convert a function to a curried function.
####          Example: 

#####          with:
```js
              const StandardAdd = (a, b) => a + b;
              const StandardAdd3 = (a, b, c) => a + b + c;
```
#####          use:
```js
              const CurriedAdd = curried(StandardAdd);
              console.log(CurriedAdd(1)(2)); // 3
```
```js
              const CurriedAdd3 = curried(StandardAdd3);
              console.log(CurriedAdd3(1)(2,3)); // 6
              console.log(CurriedAdd3(1)(2)(3)); // 6
```

## pipe argument
#### Pipe an object or value through a series of curried functions.
####          Example:

#####          with:
```js
              const StandardAdd = (a, b) => a + b;
              const StandardAdd3 = (a, b, c) => a + b + c;

              const CurriedAdd = (a) => (b) => a + b;
              const AltCurriedAdd = curried(StandardAdd);
              const CurriedAdd3 = curried(StandardAdd3);
```
#####          use:
```js
              const result = pipe(
                  1,
                  CurriedAdd(2),
                  AltCurriedAdd(3)
                  CurriedAdd3(4, 5)
              ); // 15
```
#####          avoid:
```js
              const errorResult = pipe(1, StandardAdd(1)) // Error
```

## pipe functions
#### Pipe a series of curried functions together.
####          Example:

#####          with:
```js
              const StandardAdd = (a, b) => a + b;

              const CurriedAdd = (a) => (b) => a + b;
              const AltCurriedAdd = curried(StandardAdd);
```
#####          use:
```js
              const PipedFunction = pipe(
                  CurriedAdd(2),
                  AltCurriedAdd(3)
              ); 
              const result = PipedFunction(1); // 6
```
#####          avoid:
```js
              const ErrorPipe = pipe(StandardAdd(1), StandardAdd(1)) 
              const errorResult = ErrorPipe(1) // Error
```