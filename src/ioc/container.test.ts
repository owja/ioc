import {Container} from "./container";

describe("Container", () => {

    let container: Container;

    const exampleSymbol = Symbol.for("example");

    beforeEach(() => {
        container = new Container()
    });

    test("can bind a factory", () => {
        container.bind<string>(exampleSymbol).toFactory(() => "hello world");
        expect(container.get<string>(exampleSymbol)).toBe("hello world");
    });

    test("can bind a constructable", () => {
        interface IExampleConstructable {hello: string}

        container.bind<IExampleConstructable>(exampleSymbol).to(class implements IExampleConstructable {hello = "world";});
        expect(container.get<IExampleConstructable>(exampleSymbol).hello).toBe("world");
    });

    test("can bind a constant value", () => {
        container.bind<string>(exampleSymbol).toValue("constant world");
        expect(container.get<string>(exampleSymbol)).toBe("constant world");
    });

    test("can not bind to a symbol more than once", () => {
        container.bind(exampleSymbol);
        expect(() => container.bind(exampleSymbol)).toThrow("object can only bound once: Symbol(example)");
    });

    test("can not get unbound dependency", () => {
        container.bind(exampleSymbol);
        expect(() => container.get<string>(exampleSymbol)).toThrow("nothing is bound to Symbol(example)");
    });

    test("can rebind to a symbol", () => {
        container.bind<string>(exampleSymbol).toValue("hello world");
        expect(container.get(exampleSymbol)).toBe("hello world");

        container.rebind<string>(exampleSymbol).toValue("good bye world");
        expect(container.get(exampleSymbol)).toBe("good bye world");
    });

    test("can only rebind to a symbol if it was bound before", () => {
        expect(() => container.rebind(exampleSymbol)).toThrow("Symbol(example) was never bound");
    });

    test("can remove a symbol", () => {
        container.bind<string>(exampleSymbol).toValue("hello world");
        expect(container.get(exampleSymbol)).toBe("hello world");

        container.remove(exampleSymbol);
        expect(() => container.get(exampleSymbol)).toThrow("nothing bound to Symbol(example)");
    });

    test("can snapshot and restore the registry", () => {
        container.bind<string>(exampleSymbol).toValue("hello world");
        expect(container.get(exampleSymbol)).toBe("hello world");

        container.snapshot();
        container.rebind<string>(exampleSymbol).toValue("after first snapshot");
        expect(container.get(exampleSymbol)).toBe("after first snapshot");

        container.snapshot();
        container.rebind<string>(exampleSymbol).toValue("after second snapshot");
        expect(container.get(exampleSymbol)).toBe("after second snapshot");

        container.snapshot();
        container.rebind<string>(exampleSymbol).toValue("after fourth snapshot");
        expect(container.get(exampleSymbol)).toBe("after fourth snapshot");

        container.restore();
        expect(container.get(exampleSymbol)).toBe("after second snapshot");

        container.restore();
        expect(container.get(exampleSymbol)).toBe("after first snapshot");

        container.restore();
        expect(container.get(exampleSymbol)).toBe("hello world");

        container.restore();
        expect(container.get(exampleSymbol)).toBe("hello world");
    });

});
