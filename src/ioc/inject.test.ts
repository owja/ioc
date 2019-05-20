import {Container} from "./container";
import {inject} from "./inject";

const container = new Container();

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
    "parent": Symbol.for("parent"),
    "child1": Symbol.for("child1"),
    "child2": Symbol.for("child2"),
    "child3": Symbol.for("child3"),
    "child4": Symbol.for("child4"),
    "circular1": Symbol.for("circular1"),
    "circular2": Symbol.for("circular2"),
    "circularFail1": Symbol.for("circularFail1"),
    "circularFail2": Symbol.for("circularFail2"),
};

class Parent implements ITestClass {
    name = "parent";
    @inject(TYPE.child1, container)
    childOne!: ITestClass;
    @inject(TYPE.child2, container)
    childTwo!: ITestClass;
}

class ChildOne implements ITestClass {
    name = "child one";
    @inject(TYPE.child2, container)
    childOne!: ITestClass;
    @inject(TYPE.child3, container)
    childTwo!: ITestClass;
}

class ChildTwo implements ITestClass {
    name = "child two";
    @inject(TYPE.child1, container)
    childOne!: ITestClass;
}

class ChildThree implements ITestClass {
    name = "child three";
    @inject(TYPE.child4, container)
    childOne!: ITestClass;
    @inject(TYPE.parent, container)
    childTwo!: ITestClass;
}

class ChildFour implements ITestClass {
    name = "child four";
}

class Circular1 implements ICircular {
    @inject(TYPE.circular2, container)
    circular!: ICircular;
    get circularName(): string {
        return this.circular.name;
    }
    constructor(public name: string) {}
}

class Circular2 implements ICircular {
    @inject(TYPE.circular1, container)
    circular!: ICircular;
    get circularName(): string {
        return this.circular.name;
    }
    constructor(public name: string) {}
}

class CircularFail1 implements ICircular {
    @inject(TYPE.circularFail2, container)
    circular!: ICircular;
    circularName: string = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
}

class CircularFail2 implements ICircular {
    @inject(TYPE.circularFail1, container)
    circular!: ICircular;
    circularName: string = "";
    constructor(public name: string) {
        this.circularName = this.circular.name;
    }
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

});
