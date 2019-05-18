import {Container} from "./container";
import {inject} from "./inject";

const container = new Container();

interface ITestClass {
    name: string;
    childOne?: ITestClass;
    childTwo?: ITestClass;
}

const TYPE = {
    "parent": Symbol.for("parent"),
    "child1": Symbol.for("child1"),
    "child2": Symbol.for("child2"),
    "child3": Symbol.for("child3"),
    "child4": Symbol.for("child4"),
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

container.bind<ITestClass>(TYPE.parent).to(Parent);
container.bind<ITestClass>(TYPE.child1).to(ChildOne);
container.bind<ITestClass>(TYPE.child2).to(ChildTwo);
container.bind<ITestClass>(TYPE.child3).to(ChildThree);
container.bind<ITestClass>(TYPE.child4).to(ChildFour);

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

});
