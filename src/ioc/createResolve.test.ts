import {Container} from "./container";

import {NOCACHE, NOPLUGINS} from "./tags";
import {token} from "./token";

import {createResolve} from "./createResolve";

const TYPE = {
    cacheTest: token<number>("cacheTest"),
};

const container = new Container();
const resolve = createResolve(container);

class ResolveTest {
    cached = resolve(TYPE.cacheTest);
    notCached = resolve(TYPE.cacheTest, [NOCACHE]);
    noPlugins = resolve(TYPE.cacheTest, NOPLUGINS);
}

let count: number;
container.bind(TYPE.cacheTest).toFactory(() => ++count);

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
            const cached = resolve(TYPE.cacheTest);
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
            const cached = resolve(TYPE.cacheTest, [NOCACHE]);
            cached();
            cached();
            cached();
            return cached();
        }

        expect(ResolveTestFunctionCacheNoCache()).toBe(4);
    });

    describe("with a plugin", () => {
        const plugin = jest.fn();
        let testCls: ResolveTest;

        container.addPlugin(plugin);

        beforeEach(() => {
            plugin.mockReset();
            testCls = new ResolveTest();
        });

        test("should have executed the plugin", () => {
            testCls.cached();
            expect(plugin).toHaveBeenCalledTimes(1);
        });

        test("should NOT have executed the plugin with NOPLUGINS symbol", () => {
            testCls.noPlugins();
            expect(plugin).not.toBeCalled();
        });

        test("should pass the arguments", () => {
            testCls.notCached();
            expect(plugin.mock.calls[0][2].indexOf(NOCACHE)).not.toBe(-1);
        });

        test("should pass the ResolveTest class as 2nd argument", () => {
            testCls.cached();
            expect(plugin.mock.calls[0][1]).toBe(testCls);
        });
    });
});
