import {Container} from "./container";
import {NOCACHE} from "./tags";
import {token} from "./token";

import {createWire} from "./createWire";

const TYPE = {
    cacheTest: token<number>("cacheTest"),
    oneArg: token<OneArg>("oneArg"),
    twoArgs: token<TwoArgs>("twoArg"),
    factoryOneArg: token<string>("factoryOneArg"),
    factoryTwoArg: token<string>("factoryTwoArgs"),
};

class OneArg {
    constructor(public name: string) {}
}

class TwoArgs {
    constructor(public name: string, public name2: string) {}
}

const container = new Container();
const wire = createWire(container);

class WireTest {
    cached!: number;
    notCached!: number;

    constructor() {
        wire(this, "cached", TYPE.cacheTest);
        wire(this, "notCached", TYPE.cacheTest, [NOCACHE]);
    }
}

class ctorArgumentsWireTest {
    oneArg!: OneArg;
    twoArgs!: TwoArgs;

    constructor() {
        wire<OneArg, this, "oneArg", ConstructorParameters<typeof OneArg>>(
            this,
            "oneArg",
            TYPE.oneArg,
            [],
            "with one arg",
        );
        wire(this, "twoArgs", TYPE.twoArgs, [], "with", "two args");
    }
}

class factoriesArgumentsWireTest {
    oneArg!: string;
    twoArgs!: string;

    constructor() {
        wire(this, "oneArg", TYPE.factoryOneArg, [], "with one arg");
        wire(this, "twoArgs", TYPE.factoryTwoArg, [], "with", "two args");
    }
}

let count: number;
container.bind(TYPE.cacheTest).toFactory(() => ++count);
container.bind(TYPE.oneArg).to(OneArg);
container.bind(TYPE.twoArgs).to(TwoArgs);
container.bind(TYPE.factoryOneArg).toFactory((a: string) => a);
container.bind(TYPE.factoryTwoArg).toFactory((a: string, b: string) => `${a} - ${b}`);

describe("Wire", () => {
    test("resolves new data only on first access", () => {
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

    test("resolves new data every time it get accessed", () => {
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

    test("resolve a dependency with constructor argument(s)", () => {
        const wireTest = new ctorArgumentsWireTest();
        expect(wireTest.oneArg.name).toBe("with one arg");
        expect(wireTest.twoArgs.name).toBe("with");
        expect(wireTest.twoArgs.name2).toBe("two args");
    });

    test("resolve a dependency with factories argument(s)", () => {
        const wireTest = new factoriesArgumentsWireTest();
        expect(wireTest.oneArg).toBe("with one arg");
        expect(wireTest.twoArgs).toBe("with - two args");
    });
});
