# @owja/ioc

[![npm version](https://img.shields.io/npm/v/@owja/ioc/latest)](https://badge.fury.io/js/%40owja%2Fioc)
[![npm version](https://img.shields.io/npm/v/@owja/ioc/next)](https://badge.fury.io/js/%40owja%2Fioc)
[![size](https://img.badgesize.io/https://unpkg.com/@owja/ioc/dist/ioc.js.svg?compression=brotli&label=size&v=1)](https://unpkg.com/@owja/ioc/dist/ioc.js)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/owja/ioc/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/owja/ioc/tree/master)
![npm](https://img.shields.io/npm/dm/@owja/ioc)

This library implements dependency injection for javascript and typescript.

## Features

* Similar syntax to InversifyJS
* Can be used without decorators
* Less Features but **straight forward**
* Can bind dependencies as **classes**, **factories** and **static values** and provide dependencie arguments or parameters if needed
* Supports binding in **singleton scope**
* **Cached** - Resolves only once in each dependent class by default
* **Cache can switched off** directly at the inject decorator
* Made with **unit testing** in mind
* Supports dependency **rebinding** and container **snapshots** and **restores**
* **Lightweight** - Below 1kb brotli/gzip compressed
* Does **NOT** need reflect-metadata which size is around 50 kb
* 100% written in **Typescript**

## Install

```bash
npm install --save-dev @owja/ioc
```

Latest preview/dev version (alpha or beta)

```bash
npm install --save-dev @owja/ioc@next
```

## The Container API

### Creating a container

The container is the place where all dependencies get bound to. It is possible to have
multiple container in our project in parallel.

```ts
import {Container} from "@owja/ioc";
const container = new Container();
```

### Binding

#### Binding a class

This is the default way to bind a dependency. The class will get instantiated when the
dependency gets resolved. You will be able to pass down it's dependencie arguments once you resolve it.


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
container.bind<string>(symbol).toFactory((a: string) => `I need a string parameter: ${a}`);
```

A factory can configured for singleton scope too. This way will only executed once.

```ts
container.bind<ServiceInterface>(symbol).toFactory(() => new Service()).inSingletonScope();
```

#### Binding a value

This is always like singleton scope, but it should be avoid to instantiate
dependencies here. If they are circular dependencies, they will fail. 

```ts
container.bind<ServiceInterface>(symbol).toValue(new Service()); // Bad, should be avoid
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

Getting dependencies without `@inject` decorators trough `container.get()` is only meant for **unit tests**. 
This is also the internal way how the `@inject` decorator and the functions `wire()` and `resolve()` are getting the
dependency.
 
```ts
container.get<Interface>(symbol);
```

To get a dependency without `@inject` decorator in production code use `wire()` or `resolve()`. Using `container.get()`
directly to getting dependencies can result in infinite loops with circular dependencies when called inside of
constructors. In addition `container.get()` does not respect the cache. 

> **Important Note:**  You should avoid accessing the dependencies from any constructor. With circular dependencies
> this can result in a infinite loop.

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

To use the decorator you have to set `experimentalDecorators` to `true`
in your `tsconfig.json`.

First we have to create a `inject` decorator for each container: 

```ts
import {createDecorator} from "@owja/ioc";
export const inject = createDecorator(container);
```

Then we can use the decorator to inject the dependency.

```ts
class Example {
    @inject(symbol/*, [tags], ...dependencie arguments*/)
    readonly service!: Interface;
    
    method() {
        this.service.doSomething();
    }
}
```

## The `wire()` Function

If we do not want to use decorators, we can use the wire function. It does the same like the `inject`
decorator and we have to create the function first like we do with `inject`.

```ts
import {createWire} from "@owja/ioc";
export const wire = createWire(container);
```

Then we can wire up the dependent to the dependency.

```ts
class Example {
    readonly service!: Interface;
    
    constructor() {
        wire(this, "service", symbol/*, [tags], ...dependencie arguments*/);
    }
    
    method() {
        this.service.doSomething();
    }
}
```

> Notice: With `wire()` the property, in this case `service`, has to be public. 

## The `resolve()` Function

A second way to resolve a dependency without decorators is to use `resolve()`.
To use `resolve()` we have to create the function first.

```ts
import {createResolve} from "@owja/ioc";
export const resolve = createResolve(container);
```

Then we can resolve the dependency in classes and even functions.

```ts
class Example {
    private readonly service = resolve<Interface>(symbol);
    
    method() {
        this.service(/*...dependencie arguments*/).doSomething();
    }
}
```

```ts
function Example() {
    const service = resolve<Interface>(symbol);
    service(/*...dependencie arguments*/).doSomething();
}
```

> Notice: We access the dependency trough a function.
> The dependency is not assigned directly to the property/constant.
> If we want direct access we can use `container.get()` but we should avoid
> using `get()` inside of classes because we then loose the lazy dependency
> resolving/injection behavior and caching.

## The `symbol`

Symbols are used to identify our dependencies. A good practice is to keep them in one place.

```ts
export const TYPE = {
    "Service" = Symbol("Service"),
    // [...]
}
```

Symbols can be defined with `Symbol.for()` too. This way they are not unique.
Remember `Symbol('foo') === Symbol('foo')` is `false` but
`Symbol.for('foo') === Symbol.for('foo')` is `true`

```ts
export const TYPE = {
    "Service" = Symbol.for("Service"),
    // [...]
}
```

> Since 1.0.0-beta.3 we use the symbol itself for indexing the dependencies.
> Prior to this version we indexed the dependencies by the string of the symbol.

## :new: Type-Safe Token (new in 2.0)

With version 2 we added the possibility to use a type-safe way to identify our dependencies. This is done with tokens:

```ts
export TYPE = {
    "Service" = token<MyServiceInterface>("Service"),
    // [...]
}
```

In this case the type `MyServiceInterface` is inherited when using `container.get(TYPE.Service)`, `resolve(TYPE.Service)`
and `wire(this, "service", TYPE.Service)`and does not need to be explicitly added. In case of the decorator `@inject(TYPE.Service)` it needs to be added
but it throws a type error if the types don't match:

```ts
class Example {
    @inject(TYPE.Service/*, [tags], ...dependencie arguments*/) // throws a type error because WrongInterface is not compatible with MyServiceInterface
    readonly service!: WrongInterface;
}
```

Correkt:

```ts
class Example {
    @inject(TYPE.Service/*, [tags], ...dependencie arguments*/)
    readonly service!: MyServiceInterface;
}
```

## :new: Plugins (new in 2.0)

Plugins are a way to hook into the dependency resolving process and execute code which can
access the dependency and also the dependent object.

A plugin can add directly to a dependency or to the container. 

```ts
container.bind(symbol).to(MyService).withPlugin(plugin);
```

```ts
container.addPlugin(plugin);
```

The plugin is a simple function which has access to the dependency, the target (the instance which requires the dependency),
the arguments which are passed, the token or symbol which represents the dependency and the container.

```ts
type Plugin<Dependency = unknown> = (
    dependency: Dependency,
    target: unknown,
    args: symbol[],
    token: MaybeToken<Dependency>,
    container: Container,
) => void;
```

### Plugin Example

The following code is a plugin which links a preact view component to a service by calling forceUpdate every time the
service executes the listener:

```ts
import {Plugin} from "@owja/ioc";
import {Component} from "preact";

export const SUBSCRIBE = Symbol();

export const serviceListenerPlugin: Plugin<Listenable> = (service, component, args) => {
    if (args.indexOf(SUBSCRIBE) === -1 || !component) return;
    if (!isComponent(component)) return;

    const unsubscribe = service.listen(() => component.forceUpdate());
    const unmount = component.componentWillUnmount;

    component.componentWillUnmount = () => {
        unsubscribe();
        unmount?.();
    };
};

function isComponent(target: unknown) : target is Component {
    return  !!target && typeof target === "object" && "forceUpdate" in target;
}

interface Listenable {
    listen(listener: () => void): () => void;
}
```
> Note: this will fail on runtime if  `service` does not implement the `Listenable` interface because there is no type checking done

This plugin is added to the dependency directly:

```ts
const TYPE = {
    TranslationService: token<TranslatorInterface>("translation-service"),
};

container
    .bind<TranslatorInterface>(TYPE.TranslationService)
    .toFactory(translationFactory)
    .inSingletonScope()
    .withPlugin(serviceListenerPlugin);
```

In a component it is then executed when the dependency is resolved:

```ts
class Index extends Component {
    @inject(TYPE.TranslationService, [SUBSCRIBE]/*, ...dependencie arguments*/)
    readonly service!: TranslatorInterface;

    render() {
        return (
            <div>{this.service.t("greeting")}</div>
        );
    }
}
```

This works also with `wire` and `resolve`:

```ts
class Index extends Component {
    readonly service!: TranslatorInterface;

    constructor() {
        super();
        wire(this, "service", TYPE.TranslationService, [SUBSCRIBE]/*, ...dependencie arguments*/);
    }
    
    [...]
}

class Index extends Component {
    readonly service = resolve(TYPE.TranslationService, [SUBSCRIBE]/*, ...dependencie arguments*/);
    
    [...]
}

```

### Prevent Plugins from Execution

In case you add a plugin it is executed every time the dependency is resolved. If you want to prevent this you can 
add the `NOPLUGINS` tag to the arguments:

```ts
import {NOPLUGINS} from "@owja/ioc";

class Example {
    @inject(TYPE.MyService, [NOPLUGINS]/*, ...dependencie arguments*/)
    readonly service!: MyServiceInterface;
}
```

## Getting Started

#### Step 1 - Installing the OWJA! IoC library

```bash
npm install --save-dev @owja/ioc
``` 

#### Step 2 - Creating symbols for our dependencies

Now we create the folder ***services*** and add the new file ***services/types.ts***:
```ts
export const TYPE = {
    MyService: Symbol("MyService"),
    MyOtherService: Symbol("MyOtherService"),
};
```

#### Step 3 - Example services

Next we create out example services.

File ***services/my-service.ts***
```ts
export interface MyServiceInterface {
    hello: string;
}

export class MyService implements MyServiceInterface{
    hello = "world";
}
```

File ***services/my-other-service.ts***
```ts
export interface MyOtherServiceInterface {
    random: number;
}

export class MyOtherService implements MyOtherServiceInterface {
    random = Math.random();
}
```

#### Step 4 - Creating a container

Next we need a container to bind our dependencies to. Let's create the file ***services/container.ts***

```ts
import {Container, createDecorator} from "@owja/ioc";

import {TYPE} from "./types";

import {MyServiceInterface, MyService} from "./service/my-service";
import {MyOtherServiceInterface, MyOtherService} from "./service/my-other-service";

const container = new Container();
const inject = createDecorator(container);

container.bind<MyServiceInterface>(TYPE.MyService).to(MyService);
container.bind<MyOtherServiceInterface>(TYPE.MyOtherService).to(MyOtherService);

export {container, TYPE, inject};
```

#### Step 5 - Injecting dependencies

Lets create a ***example.ts*** file in our source root:
 
```ts
import {TYPE, inject} from "./service/container";
import {MyServiceInterface} from "./service/my-service";
import {MyOtherServiceInterface} from "./service/my-other-service";

class Example {
    @inject(TYPE.MyService/*, [tags], ...dependencie arguments*/)
    readonly myService!: MyServiceInterface;

    @inject(TYPE.MyOtherService/*, [tags], ...dependencie arguments*/)
    readonly myOtherService!: MyOtherServiceInterface;
}

const example = new Example();

console.log(example.myService);
console.log(example.myOtherService);
console.log(example.myOtherService);
```

If we run this example we should see the content of our example services.

The dependencies (services) will injected on the first call. This means if you rebind the service after
accessing the properties of the Example class, it will not resolve a new service. If you want a new 
service each time you call `example.myService` you have to add the `NOCACHE` tag:

```ts
// [...]
import {NOCACHE} from "@owja/ioc";

class Example {
    // [...]
    
    @inject(TYPE.MyOtherSerice, NOCACHE/*, ...dependencie arguments*/)
    readonly myOtherService!: MyOtherServiceInterface;
}

// [...]
```

In this case the last two `console.log()` outputs should show different numbers.

## Unit testing with IoC

For unit testing we first create our mocks

***test/my-service-mock.ts***
```ts
import {MyServiceInterface} from "../service/my-service";

export class MyServiceMock implements MyServiceInterface {
    hello = "test";    
}
```

***test/my-other-service-mock.ts***
```ts
import {MyOtherServiceInterface} from "../service/my-other-service";

export class MyOtherServiceMock implements MyOtherServiceInterface {
    random = 9;
}
```

Within the tests we can snapshot and restore a container.
We are able to make multiple snapshots in a row too.

File ***example.test.ts***
```ts
import {container, TYPE} from "./service/container";
import {MyServiceInterface} from "./service/my-service";
import {MyOtherServiceInterface} from "./service/my-other-service";

import {MyServiceMock} from "./test/my-service-mock";
import {MyOtherServiceMock} from "./test/my-other-service-mock";

import {Example} from "./example";

describe("Example", () => {
    
    let example: Example;
    beforeEach(() => {
        container.snapshot();
        container.rebind<MyServiceInterface>(TYPE.MyService).to(MyServiceMock);
        container.rebind<MyOtherServiceInterface>(TYPE.MyOtherService).to(MyOtherServiceMock);

        example = new Example();
    });

    afterEach(() => {
        container.restore();
    });

    test("should return \"test\"", () => {
        expect(example.myService.hello).toBe("test");
    });

    test("should return \"9\"", () => {
        expect(example.myOtherService.random).toBe(9);
    });
    
});
```

## Development

Current state of development can be seen in our
[Github Projects](https://github.com/owja/ioc/projects).

## Inspiration

This library is highly inspired by [InversifyJS](https://github.com/inversify/InversifyJS)
but has other goals:

1. Make the library very lightweight (less than one kilobyte)
2. Implementing less features to make the API more straight forward
3. Always lazy inject the dependencies
4. No meta-reflect required

## License

**MIT**

Copyright © 2019-2022 The OWJA! Team
