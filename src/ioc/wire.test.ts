import {Container} from "./container";
import {NOCACHE} from "./tags";
import {token} from "./token";

import {createWire} from "./wire";

const TYPE = {
    cacheTest: token<number>("cacheTest"),
};

const container = new Container();
const wire = createWire(container);

class WireTest {
    cached!: number;
    notCached!: number;

    constructor() {
        wire(this, "cached", TYPE.cacheTest);
        wire(this, "notCached", TYPE.cacheTest, NOCACHE);
    }
}

let count: number;
container.bind(TYPE.cacheTest).toFactory(() => ++count);

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
});
