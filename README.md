![OWJA! IoC](resources/owja-ioc-logo.png)

[![npm version](https://img.shields.io/npm/v/@owja/ioc.svg)](https://badge.fury.io/js/%40owja%2Fioc)
[![codecov](https://codecov.io/gh/owja/ioc/branch/master/graph/badge.svg)](https://codecov.io/gh/owja/ioc)
[![Greenkeeper badge](https://badges.greenkeeper.io/owja/ioc.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/owja/ioc.svg?branch=master)](https://travis-ci.org/owja/ioc)
[![gzip size](http://img.badgesize.io/https://unpkg.com/@owja/ioc/dist/ioc.mjs?compression=gzip)](https://unpkg.com/@owja/ioc/dist/ioc.mjs)
[![size](https://badgen.net/packagephobia/install/@owja/ioc)](https://unpkg.com/@owja/ioc/dist/ioc.mjs)

This library implements dependency injection for javascript.
It is currently work in progress and in unstable beta phase
but the API should not change anymore before 1.0.0 stable release
will arrived.

### Usage

##### Step 1 - Installing the OWJA! IoC library

```bash
npm install --save-dev @owja/ioc
``` 

##### Step 2 - Create symbols for our dependencies

Now we create the folder ***services*** and add the new file ***services/types.ts***:
```ts
export const TYPE = {
    "MyService" = Symbol.for("MyService"),
    "MyOtherService" = Symbol.for("MyOtherService"),
};
```

##### Step 3 - Creating a container

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

##### Step 4 - Injecting dependencies

Lets create a ***example.ts*** file in our source root:
 
```ts
import {container, TYPE, inject} from "./services/container";
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

If we run this example we should see the content of our example services.

### Unit testing with IoC

We can snapshot and restore a container for unit testing.
We are able to make multiple snapshots in a row too.

```ts
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

### Development

We are working on the first stable release. Current state of development can be seen in our
[Github Project](https://github.com/owja/ioc/projects/1) for the first release.

### Inspiration

This library is highly inspired by [InversifyJS](https://github.com/inversify/InversifyJS)
but has other goals:

1. Make the library very lightweight (less than one kilobyte)
2. Implementing less features to make the API more straight forward
3. Always lazy inject the dependencies
4. No meta-reflect required

### License

License under [Creative Commons Attribution 4.0 International](https://spdx.org/licenses/CC-BY-4.0.html)

Copyright © 2019 Hauke Broer
