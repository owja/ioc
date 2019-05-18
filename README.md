# OWJA! IoC

[![Build Status](https://travis-ci.org/owja/ioc.svg?branch=master)](https://travis-ci.org/owja/ioc)
[![codecov](https://codecov.io/gh/owja/ioc/branch/master/graph/badge.svg)](https://codecov.io/gh/owja/ioc)

This library implements dependency injection for javascript.
It is currently work in progress and not jet released.

### Usage

> No package delivered jet!

##### Step 1 - Install the OWJA! IoC library

```bash
npm install --save-dev <unreleased>
``` 

##### Step 3 - Create symbols for your dependencies

Create a folder ***ioc*** and add the new file ***ioc/types.ts***:
```ts
export const TYPE = {
    "MyService" = Symbol.for("MyService"),
    "MyOtherService" = Symbol.for("MyOtherService"),
};
```

##### Step 2 - Create a container

Next need a container to bind your dependencies to. Lets create the file ***ioc/container.ts***

```ts
import {Container, inject} from <unreleased>;

import {TYPE} from "./types";

import {IMyService, MyService} from "./service/my-service";
import {IMyOtherService, MyOtherService} from "./service/my-other-service";

const container = new Container();

container.bind<IMyService>(TYPE.MyService).to(MyService);
container.bind<IMyOtherService>(TYPE.MyOtherService).to(MyOtherService);

export {container, TYPE, inject};
```

##### Step 3 - Inject your dependency

Lets create a ***example.ts*** file in your source root:
 
```ts
import {container, TYPE, inject} from "./ioc/container";
import {IMyService} from "./service/my-service";

class Example {
    
    @inject(TYPE.MyService)
    readonly myService!: IMyService;
    
    @inject(TYPE.MyOtherSerice)
    readonly myOtherService!: IMyOtherService;
    
}

const example = new Example();

console.log(example.myService);
console.log(example.myOtherSerice);
```

If you run this example you should see the content of your example services.

### Unit testing with IoC

You can snapshot and restore a container for unit testing. You can make multiple snapshots in a row,
but that is not recommend.

```ts
beforeEach(() => {
    container.snapshot();
});

afterEach(() => {
    container.restore();
}

test("can snapshot and restore the registry", () => {
    container.rebind<MyServiceMock>(TYPE.MySerice).to(MyServiceMock);
    // ...
});
```

### Development

I am working on the first release. Current state can you see in the
[Github Project](https://github.com/owja/ioc/projects/1).

### Inspiration

This library is highly inspired by [InversifyJS](https://github.com/inversify/InversifyJS)
but has other goals:

1. I want to make a very lightweight solution
2. I want implement less features to be more straight forward
3. Always lazy inject the dependencies

### License

License under [Creative Commons Attribution 4.0 International](https://spdx.org/licenses/CC-BY-4.0.html)

Copyright © 2019 Hauke Broer
