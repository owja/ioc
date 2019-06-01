import {Container} from "./container";
import {createDecorator, createWire, NOCACHE, SUBSCRIBE} from "./inject";

const container = new Container();
const inject = createDecorator(container);
const wire = createWire(container);

interface ITestClass {
    name: string;
    childOne?: ITestClass;
    childTwo?: ITestClass;
}

interface ICircular {
    name: string;
    circular?: ICircular;
    circularName: string;
}

const TYPE = {
    parent: Symbol.for("parent"),
    child1: Symbol.for("child1"),
    child2: Symbol.for("child2"),
    child3: Symbol.for("child3"),
    child4: Symbol.for("child4"),
    circular1: Symbol.for("circular1"),
    circular2: Symbol.for("circular2"),
    circularFail1: Symbol.for("circularFail1"),
    circularFail2: Symbol.for("circularFail2"),
    cacheTest: Symbol.for("cacheTest"),
    subscribable: Symbol.for("subscribable"),
    subscribable2: Symbol.for("subscribable2"),
};

class Parent implements ITestClass {
    name = "parent";
    @inject(TYPE.child1)
    childOne!: ITestClass;
    @inject(TYPE.child2)
    childTwo!: ITestClass;
}

class ChildOne implements ITestClass {
    name = "child one";
    @inject(TYPE.child2)
    childOne!: ITestClass;
    @inject(TYPE.child3)
    childTwo!: ITestClass;
}

class ChildTwo implements ITestClass {
    name = "child two";
    @inject(TYPE.child1)
    childOne!: ITestClass;
}

class ChildThree implements ITestClass {
    name = "child three";
    @inject(TYPE.child4)
    childOne!: ITestClass;
    @inject(TYPE.parent)
    childTwo!: ITestClass;
}

class ChildFour implements ITestClass {
    name = "child four";
}

class Circular1 implements ICircular {
    @inject(TYPE.circular2)
    circular!: ICircular;
    get circularName(): string {
        return this.circular.name;
    }
    constructor(public name: string) {}
}

class Circular2 implements ICircular {
    @inject(TYPE.circular1)
    circular!: ICircular;
    get circularName(): string {
        return this.circular.name;
    }
    constructor(public name: string) {}
}

class CircularFail1 implements ICircular {
    @inject(TYPE.circularFail2)
    circular!: ICircular;
    circularName: string = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
}

class CircularFail2 implements ICircular {
    @inject(TYPE.circularFail1)
    circular!: ICircular;
    circularName: string = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
}

class CacheTest {
    @inject(TYPE.cacheTest)
    cached!: number;
    @inject(TYPE.cacheTest, NOCACHE)
    notCached!: number;
}

class WireTest {
    cached!: number;
    notCached!: number;

    constructor() {
        wire(this, "cached", TYPE.cacheTest);
        wire(this, "notCached", TYPE.cacheTest, NOCACHE);
    }
}

class Subscribable {
    listener: (() => void)[] = [];

    listen(listener: () => void): () => void {
        this.listener.push(listener);
        return () => this.listener.splice(this.listener.indexOf(listener), 1);
    }

    trigger() {
        this.listener.forEach((cb) => cb());
    }
}

class Updateable {
    @inject(TYPE.subscribable, SUBSCRIBE)
    service!: Subscribable;
    @inject(TYPE.subscribable2, SUBSCRIBE)
    service2!: Subscribable;
    forceUpdate() {}
}

container.bind<ITestClass>(TYPE.parent).to(Parent);
container.bind<ITestClass>(TYPE.child1).to(ChildOne);
container.bind<ITestClass>(TYPE.child2).to(ChildTwo);
container.bind<ITestClass>(TYPE.child3).to(ChildThree);
container.bind<ITestClass>(TYPE.child4).to(ChildFour);
container.bind<ICircular>(TYPE.circularFail1).toFactory(() => new CircularFail1("one"));
container.bind<ICircular>(TYPE.circularFail2).toFactory(() => new CircularFail2("two"));
container.bind<ICircular>(TYPE.circular1).toFactory(() => new Circular1("one"));
container.bind<ICircular>(TYPE.circular2).toFactory(() => new Circular2("two"));
container
    .bind<Subscribable>(TYPE.subscribable)
    .to(Subscribable)
    .inSingletonScope();
container
    .bind<Subscribable>(TYPE.subscribable2)
    .to(Subscribable)
    .inSingletonScope();

let count: number;
container.bind<number>(TYPE.cacheTest).toFactory(() => ++count);

describe("Injector", () => {
    let instance: Parent;

    beforeEach(() => {
        instance = new Parent();
    });

    test("can inject first level", () => {
        expect(instance.childOne.name).toBe("child one");
        expect(instance.childTwo.name).toBe("child two");
    });

    test("can inject deep", () => {
        expect((instance.childOne.childOne as any).name).toBe("child two");
        expect((instance.childOne.childTwo as any).name).toBe("child three");
        expect((instance.childOne.childTwo as any).childOne.name).toBe("child four");
    });

    test("can inject parent", () => {
        expect((instance.childOne.childOne as any).childOne.name).toBe("child one");
        expect((instance.childOne.childTwo as any).childTwo.name).toBe("parent");
    });

    test("can inject a circular dependency when accessing the dependency outside of constructor", () => {
        const instance1 = container.get<ICircular>(TYPE.circular1);
        const instance2 = container.get<ICircular>(TYPE.circular2);

        expect(instance1.circularName).toBe("two");
        expect(instance2.circularName).toBe("one");
    });

    test("can not inject a circular dependency when accessing the dependency inside of constructor", () => {
        expect(() => container.get<ICircular>(TYPE.circularFail1)).toThrow("Maximum call stack size exceeded");
    });

    test("resolves only once with cache enabled by default", () => {
        count = 0;
        const cacheTest = new CacheTest();
        expect(cacheTest.cached).toBe(1);
        expect(cacheTest.cached).toBe(1);
        expect(cacheTest.cached).toBe(1);
    });

    test("resolves new data each request without cache enabled", () => {
        count = 0;
        const cacheTest = new CacheTest();
        expect(cacheTest.notCached).toBe(1);
        expect(cacheTest.notCached).toBe(2);
        expect(cacheTest.notCached).toBe(3);
    });

    test("resolves new data with new instance even with cache enabled", () => {
        count = 0;
        const cacheTest1 = new CacheTest();
        expect(cacheTest1.cached).toBe(1);
        expect(cacheTest1.cached).toBe(1);

        count = 9;
        const cacheTest2 = new CacheTest();
        expect(cacheTest2.cached).toBe(10);
        expect(cacheTest2.cached).toBe(10);

        // final proof
        expect(cacheTest1.cached).toBe(1);
    });

    test("resolves new data with new instance even with cache disabled", () => {
        count = 0;
        const cacheTest1 = new CacheTest();
        const cacheTest2 = new CacheTest();
        expect(cacheTest1.notCached).toBe(1);
        expect(cacheTest1.notCached).toBe(2);
        expect(cacheTest2.notCached).toBe(3);
        expect(cacheTest2.notCached).toBe(4);

        // final proof
        expect(cacheTest1.notCached).toBe(5);
    });

    test("resolves new data with new instance even with cache enabled (with wire)", () => {
        count = 0;
        const cacheTest1 = new WireTest();
        expect(cacheTest1.cached).toBe(1);
        expect(cacheTest1.cached).toBe(1);

        count = 9;
        const cacheTest2 = new WireTest();
        expect(cacheTest2.cached).toBe(10);
        expect(cacheTest2.cached).toBe(10);

        // final proof
        expect(cacheTest1.cached).toBe(1);
    });

    test("resolves new data with new instance even with cache disabled (with wire)", () => {
        count = 0;
        const cacheTest1 = new WireTest();
        const cacheTest2 = new WireTest();
        expect(cacheTest1.notCached).toBe(1);
        expect(cacheTest1.notCached).toBe(2);
        expect(cacheTest2.notCached).toBe(3);
        expect(cacheTest2.notCached).toBe(4);

        // final proof
        expect(cacheTest1.notCached).toBe(5);
    });

    /**
     * Just a dirty test for the hard coded implementation
     */
    test("dirty subscribable test", () => {
        const subscribable = container.get<Subscribable>(TYPE.subscribable);
        const subscribable2 = container.get<Subscribable>(TYPE.subscribable2);
        const listener = new Updateable();

        jest.spyOn<any, any>(listener, "forceUpdate");

        expect(subscribable.listener).toHaveLength(0); // not registered the listener jet
        expect(subscribable2.listener).toHaveLength(0); // not registered the listener jet

        listener.service.trigger();
        listener.service2.trigger();
        expect(listener.forceUpdate).toHaveBeenCalledTimes(2);

        expect(subscribable.listener).toHaveLength(1); // after accessing the property it is registered
        expect(subscribable2.listener).toHaveLength(1); // after accessing the property it is registered

        (listener as any).componentWillUnmount();
        expect(subscribable.listener).toHaveLength(0);
        expect(subscribable2.listener).toHaveLength(0);
    });
});
