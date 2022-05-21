import {Container} from "./container";
import {NOCACHE} from "./symbol";

import {createResolve} from "./resolve";

const TYPE = {
    cacheTest: Symbol.for("cacheTest"),
};

const container = new Container();
const resolve = createResolve(container);

class ResolveTest {
    cached = resolve<number>(TYPE.cacheTest);
    notCached = resolve<number>(TYPE.cacheTest, NOCACHE);
}

let count: number;
container.bind<number>(TYPE.cacheTest).toFactory(() => ++count);

describe("Resolve", () => {
    test("resolves new data only on first access", () => {
        count = 0;
        const cacheTest1 = new ResolveTest();
        expect(cacheTest1.cached()).toBe(1);
        expect(cacheTest1.cached()).toBe(1);

        count = 9;
        const cacheTest2 = new ResolveTest();
        expect(cacheTest2.cached()).toBe(10);
        expect(cacheTest2.cached()).toBe(10);

        // final proof
        expect(cacheTest1.cached()).toBe(1);
    });

    test("resolves new data every time it get accessed", () => {
        count = 0;
        const cacheTest1 = new ResolveTest();
        const cacheTest2 = new ResolveTest();
        expect(cacheTest1.notCached()).toBe(1);
        expect(cacheTest1.notCached()).toBe(2);
        expect(cacheTest2.notCached()).toBe(3);
        expect(cacheTest2.notCached()).toBe(4);

        // final proof
        expect(cacheTest1.notCached()).toBe(5);
    });

    test("a function can use resolve", () => {
        count = 0;

        function ResolveTestFunctionCached() {
            const cached = resolve<number>(TYPE.cacheTest);
            cached();
            cached();
            cached();
            return cached();
        }

        expect(ResolveTestFunctionCached()).toBe(1);
    });

    test("a function can use resolve without cache", () => {
        count = 0;

        function ResolveTestFunctionCacheNoCache() {
            const cached = resolve<number>(TYPE.cacheTest, NOCACHE);
            cached();
            cached();
            cached();
            return cached();
        }

        expect(ResolveTestFunctionCacheNoCache()).toBe(4);
    });
});
