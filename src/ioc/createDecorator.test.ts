import {Container} from "./container";
import {NOCACHE} from "./tags";

import {createDecorator} from "./createDecorator";

const container = new Container();
const inject = createDecorator(container);

interface ITestClass {
    name: string;
    childOne?: ITestClass;
    childTwo?: ITestClass;
}

const factoryOneArg = (a: string) => a;
const factoryTwoArg = (a: string, b: string) => `${a} - ${b}`;

interface ICircular {
    name: string;
    circular?: ICircular;
    circularName: string;
}

const TYPE = {
    parent: Symbol.for("parent"),
    withCtorArgs: Symbol.for("withArgs"),
    with2CtorArgs: Symbol.for("with2Args"),
    factoryOneArg: Symbol.for("factoryOneArg"),
    factoryTwoArgs: Symbol.for("factoryTwoArgs"),
    child1: Symbol.for("child1"),
    child2: Symbol.for("child2"),
    child3: Symbol.for("child3"),
    child4: Symbol.for("child4"),
    circular1: Symbol.for("circular1"),
    circular2: Symbol.for("circular2"),
    circularFail1: Symbol.for("circularFail1"),
    circularFail2: Symbol.for("circularFail2"),
    cacheTest: Symbol.for("cacheTest"),
};

class Parent implements ITestClass {
    name = "parent";
    @inject(TYPE.child1)
    childOne!: ITestClass;
    @inject(TYPE.child2)
    childTwo!: ITestClass;
}

class WithCtorArg implements ITestClass {
    constructor(public name: string) {}
}

class ChildWithCtorArg implements ITestClass {
    name = "child with arg";
    @inject<ITestClass, ConstructorParameters<typeof WithCtorArg>>(TYPE.withCtorArgs, [], "with arg")
    childOne!: ITestClass;
}

type twoArgsITestClass = ITestClass & {name2: string};
class With2CtorArgs implements twoArgsITestClass {
    constructor(public name: string, public name2: string) {}
}

class ChildWith2CtorArgs implements ITestClass {
    name = "child with 2 args";
    @inject<unknown, ConstructorParameters<typeof With2CtorArgs>>(TYPE.with2CtorArgs, [], "with", "two args")
    childOne!: twoArgsITestClass;
}

class ExtendedClassTest extends Parent {}

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
    circularName = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
}

class CircularFail2 implements ICircular {
    @inject(TYPE.circularFail1)
    circular!: ICircular;
    circularName = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
}

class CacheTest {
    @inject(TYPE.cacheTest)
    cached!: number;
    @inject(TYPE.cacheTest, [NOCACHE])
    notCached!: number;
}

class factoryWithArguments {
    @inject<string, Parameters<typeof factoryOneArg>>(TYPE.factoryOneArg, [], "hello")
    factOne!: string;

    @inject<string, Parameters<typeof factoryTwoArg>>(TYPE.factoryTwoArgs, NOCACHE, "hello", "world")
    factTwo!: string;
}

container.bind<ITestClass>(TYPE.parent).to(Parent);
container.bind<ITestClass>(TYPE.withCtorArgs).to(WithCtorArg);
container.bind<ITestClass>(TYPE.with2CtorArgs).to(With2CtorArgs);
container.bind<ITestClass>(TYPE.child1).to(ChildOne);
container.bind<ITestClass>(TYPE.child2).to(ChildTwo);
container.bind<ITestClass>(TYPE.child3).to(ChildThree);
container.bind<ITestClass>(TYPE.child4).to(ChildFour);
container.bind<ICircular>(TYPE.circularFail1).toFactory(() => new CircularFail1("one"));
container.bind<ICircular>(TYPE.circularFail2).toFactory(() => new CircularFail2("two"));
container.bind<ICircular>(TYPE.circular1).toFactory(() => new Circular1("one"));
container.bind<ICircular>(TYPE.circular2).toFactory(() => new Circular2("two"));

let count: number;
container.bind<number>(TYPE.cacheTest).toFactory(() => ++count);
container.bind<string>(TYPE.factoryOneArg).toFactory(factoryOneArg);
container.bind<string>(TYPE.factoryTwoArgs).toFactory(factoryTwoArg);

describe("Injector", () => {
    let instance: Parent;

    beforeEach(() => {
        instance = new Parent();
    });

    test("can inject first level", () => {
        expect(instance.childOne.name).toBe("child one");
        expect(instance.childTwo.name).toBe("child two");
    });

    test("inject should resolve in parent class if extended", () => {
        const ext = new ExtendedClassTest();
        expect(ext.childOne.name).toBe("child one");
        expect(ext.childTwo.name).toBe("child two");
    });

    test("can inject deep", () => {
        expect(instance.childOne.childOne?.name).toBe("child two");
        expect(instance.childOne.childTwo?.name).toBe("child three");
        expect(instance.childOne.childTwo?.childOne?.name).toBe("child four");
    });

    test("can inject parent", () => {
        expect(instance.childOne.childOne?.childOne?.name).toBe("child one");
        expect(instance.childOne.childTwo?.childTwo?.name).toBe("parent");
    });

    test("can inject with one arg", () => {
        const child = new ChildWithCtorArg();
        expect(child.childOne.name).toBe("with arg");
    });

    test("can inject with two args", () => {
        const child = new ChildWith2CtorArgs();
        expect(child.childOne.name).toBe("with");
        expect(child.childOne.name2).toBe("two args");
    });

    test("can inject factories with arg(s)", () => {
        const child = new factoryWithArguments();
        expect(child.factOne).toBe("hello");
        expect(child.factTwo).toBe("hello - world");
    });

    test("can inject a circular dependency when accessing the dependency outside of constructor", () => {
        const instance1 = container.get<ICircular>(TYPE.circular1);
        const instance2 = container.get<ICircular>(TYPE.circular2);

        expect(instance1.circularName).toBe("two");
        expect(instance2.circularName).toBe("one");
    });

    test("can not inject a circular dependency when accessing the dependency inside of constructor", () => {
        expect(() => container.get(TYPE.circularFail1)).toThrow("Maximum call stack size exceeded");
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
});
