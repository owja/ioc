![OWJA! IoC](resources/owja-ioc-logo.png)

[![npm version](https://img.shields.io/npm/v/@owja/ioc.svg)](https://badge.fury.io/js/%40owja%2Fioc)
[![codecov](https://codecov.io/gh/owja/ioc/branch/master/graph/badge.svg)](https://codecov.io/gh/owja/ioc)
[![Greenkeeper badge](https://badges.greenkeeper.io/owja/ioc.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/owja/ioc.svg?branch=master)](https://travis-ci.org/owja/ioc)
[![size](https://img.badgesize.io/https://unpkg.com/@owja/ioc/dist/ioc.mjs.svg?compression=gzip&label=size&max=1000&softmax=800)](https://unpkg.com/@owja/ioc/dist/ioc.mjs)

This library implements dependency injection for javascript.
It is currently work in progress and in unstable beta phase
but the API should not change anymore before 1.0.0 stable release
will arrive.

## Features

* Similar syntax to InversifyJS
* Less Features but **straight forward**
* Can bind dependencies as **classes**, **factories** and **static values**
* Supports binding in **singleton scope**
* **Cached** - Resolves only once in each dependency requesting class by default
* **Cache can switched off** directly at the inject decorator
* Made with **unit testing** in mind
* Supports dependency **rebinding** and container **snapshots** and **restores**
* **Lightweight** - Just around **700 Byte gzip** and **600 Byte brotli** compressed
* Does **NOT** need reflect-metadata which size is around 50 kb
* 100% written in **Typescript**

## The Container API

### Creating a container

The container is the place where all dependencies get bound to. We can have
multiple containers in our project in parallel.

```ts
import {Container} from "@owja/ioc";
const container = new Container();
```

### Binding

#### Binding a class

This is the default way to bind a dependency. The class will get instantiated when the
dependency gets resolved.

```ts
container.bind<ServiceInterface>(symbol).to(Service);
```

#### Binding a class in singleton scope

This will create only one instance of `Service`

```ts
container.bind<ServiceInterface>(symbol).to(Service).inSingletonScope();
```

#### Binding a factory

Factories are functions which will get called when the dependency gets resolved 

```ts
container.bind<ServiceInterface>(symbol).toFactory(() => new Service());
container.bind<string>(symbol).toFactory(() => "just a string");
```

A factory can configured for singleton scope too. This way will only executed once.

```ts
container.bind<ServiceInterface>(symbol).toFactory(() => new Service()).inSingletonScope();
```

#### Binding a value

This is always like singleton scope, but it should be avoid to instantiate
dependencies here. If they are circular dependencies, they will fail. 

```ts
container.bind<ServiceInterface>(symbol).toValue(new Service());
container.bind<string>(symbol).toValue("just a string");
container.bind<() => string>(symbol).toValue(() => "i am a function");
```

### Rebinding

This is the way how we can rebind a dependency while **unit tests**. We should not need to
rebind in production code.

```ts
container.rebind<ServiceMock>(symbol).toValue(new ServiceMock());
```

### Removing

Normally this function is not used in production code. This will remove the
dependency from the container. 

```ts
container.remove(symbol);
```

### Getting a dependency

Getting dependencies without `inject` decorators are only meant for **unit tests**. This is also
the internal way the `inject` decorator gets the dependency it has to resolve.
 
```ts
container.get<Interface>(symbol);
```

### Snapshot & Restore

This creates a snapshot of the bound dependencies. After this we can rebind dependencies
and can restore it back to its old state after we made some **unit tests**.

```ts
container.snapshot();
```
```ts
container.restore();
```

## The `inject` Decorator

We have to create a `inject` decorator for each container.

```ts
import {createDecorator} from "@owja/ioc";

export const inject = createDecorator(container);
```

This decorator is needed to resolve our dependencies. 

```ts
class Example {
    @inject(symbol)
    readonly service!: Interface;
}
```

## The `symbol`

Symbols are used to identify our dependencies. A good practice is to keep them in one place.

```ts
export const TYPE = {
    "Service" = Symbol.for("Service"),
    // [...]
}
```

## Usage

#### Step 1 - Installing the OWJA! IoC library

```bash
npm install --save-dev @owja/ioc
``` 

#### Step 2 - Create symbols for our dependencies

Now we create the folder ***services*** and add the new file ***services/types.ts***:
```ts
export const TYPE = {
    "MyService" = Symbol.for("MyService"),
    "MyOtherService" = Symbol.for("MyOtherService"),
};
```

#### Step 3 - Creating a container

Next we need a container to bind our dependencies to. Let's create the file ***services/container.ts***

```ts
import {Container, createDecorator} from "@owja/ioc";

import {TYPE} from "./types";

import {IMyService, MyService} from "./service/my-service";
import {IMyOtherService, MyOtherService} from "./service/my-other-service";

const container = new Container();
const inject = createDecorator(container);

container.bind<IMyService>(TYPE.MyService).to(MyService);
container.bind<IMyOtherService>(TYPE.MyOtherService).to(MyOtherService);

export {container, TYPE, inject};
```

#### Step 4 - Injecting dependencies

Lets create a ***example.ts*** file in our source root:
 
```ts
import {container, TYPE, inject} from "./services/container";
import {IMyService} from "./service/my-service";
import {IMyOtherService} from "./service/my-other-service";

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

If we run this example we should see the content of our example services.

The dependencies (services) will injected on the first call. This means if you rebind the service after
accessing the properties of the Example class, it will not resolve the new service. If you want a new 
service each time you call `example.myService` you have to add the `NOCACHE` tag:

```ts
import {container, TYPE, inject} from "./services/container";
import {NOCACHE} from "@owja/ioc";

// [...]

class Example {
    @inject(TYPE.MyService, NOCACHE)
    readonly myService!: IMyService;
    
    @inject(TYPE.MyOtherSerice, NOCACHE)
    readonly myOtherService!: IMyOtherService;
}

// [...]
```

## Unit testing with IoC

We can snapshot and restore a container for unit testing.
We are able to make multiple snapshots in a row too.

```ts
import {container, TYPE} from "./services/container";

beforeEach(() => {
    container.snapshot();
});

afterEach(() => {
    container.restore();
}

test("can do something", () => {
    container.rebind<MyServiceMock>(TYPE.MySerice).to(MyServiceMock);
    const mock = container.get<MyServiceMock>(TYPE.MySerice);
});
```

## Development

We are working on the first stable release. Current state of development can be seen in our
[Github Project](https://github.com/owja/ioc/projects/1) for the first release.

## Inspiration

This library is highly inspired by [InversifyJS](https://github.com/inversify/InversifyJS)
but has other goals:

1. Make the library very lightweight (less than one kilobyte)
2. Implementing less features to make the API more straight forward
3. Always lazy inject the dependencies
4. No meta-reflect required

## License

License under [Creative Commons Attribution 4.0 International](https://spdx.org/licenses/CC-BY-4.0.html)

Copyright © 2019 Hauke Broer
