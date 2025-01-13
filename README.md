# MinCurryPipe
Minimal curry and pipe

## curried
#### Convert a function to a curried function.
          Example: 
```
              const StandardAdd = (a, b) => a + b;
              const StandardAdd3 = (a, b, c) => a + b + c;
              console.log(StandardAdd(1, 2)); // 3

              const CurriedAdd = curried(StandardAdd);
              console.log(CurriedAdd(1)(2)); // 3

              const CurriedAdd3 = curried(StandardAdd3);
              console.log(CurriedAdd3(1)(2,3)); // 6
              console.log(CurriedAdd3(1)(2)(3)); // 6
```

## pipe argument
#### Pipe an object or value through a series of curried functions.
          Example:
```
              const StandardAdd = (a, b) => a + b;
              const StandardAdd3 = (a, b, c) => a + b + c;

              const CurriedAdd = (a) => (b) => a + b;
              const AltCurriedAdd = curried(StandardAdd);
              const CurriedAdd3 = curried(StandardAdd3);

              const result = pipe(
                  1,
                  CurriedAdd(2),
                  AltCurriedAdd(3)
                  CurriedAdd3(4, 5)
              ); // 15

              const errorResult = pipe(1, StandardAdd(1)) // Error
```

## pipe functions
#### Pipe a series of curried functions together.
          Example:
```
              const StandardAdd = (a, b) => a + b;
              
              const CurriedAdd = (a) => (b) => a + b;
              const AltCurriedAdd = curried(StandardAdd);

              const PipeFunction = pipe(
                  CurriedAdd(2),
                  AltCurriedAdd(3)
              ); 
              const result = PipeFunction(1); // 6

              const ErrorPipe = pipe(StandardAdd(1), StandardAdd(1)) 
              const errorResult = ErrorPipe(1) // Error
```