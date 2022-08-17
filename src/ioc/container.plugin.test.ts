import {Container} from "./container";
import {NOCACHE, NOPLUGINS} from "./tags";
import {token} from "./token";
import type {Plugin} from "./types";

class TestClass {
    name = "test class";
}

describe("Container 2.0", () => {
    let container: Container;

    let plugin: jest.Mock;

    const A = token<TestClass>("test A");
    const B = token<TestClass>("test B");

    beforeEach(() => {
        container = new Container();
        plugin = jest.fn();
    });

    describe("with a plugin bound to depoendency A", () => {
        beforeEach(() => {
            container.bind(A).to(TestClass).withPlugin(plugin);
            container.bind(B).to(TestClass);
        });

        test("should return property name of the test class A and B", () => {
            expect(container.get(A).name).toBe("test class");
            expect(container.get(B).name).toBe("test class");
        });

        test("should execute the plugin when if dependency A is requested", () => {
            container.get(A);
            expect(plugin).toHaveBeenCalledTimes(1);
        });

        test("should NOT execute the plugin when if dependency A is requested with NOPLUGINS symbol", () => {
            container.get(A, [NOPLUGINS]);
            expect(plugin).not.toBeCalled();
        });

        test("should not execute the plugin if dependency B is requested", () => {
            container.get(B);
            expect(plugin).not.toBeCalled();
        });

        describe("and if the plugin changes the name property of the depencency", () => {
            beforeEach(() => {
                const mock: Plugin<TestClass> = (cls: TestClass) => {
                    cls.name = "this is changed";
                };
                plugin.mockImplementation(mock);
            });

            test("should return changed property value of dependency A", () => {
                expect(container.get(A).name).toBe("this is changed");
            });

            test("should return default property value of dependency B", () => {
                expect(container.get(B).name).toBe("test class");
            });
        });
    });

    describe("with a plugin bound to container", () => {
        beforeEach(() => {
            container.bind(A).to(TestClass);
            container.bind(B).to(TestClass).inSingletonScope();
            container.addPlugin(plugin);
        });

        test("should execute the plugin on any depencency requested", () => {
            container.get(A);
            expect(plugin).toHaveBeenCalledTimes(1);
            container.get(B);
            expect(plugin).toHaveBeenCalledTimes(2);
        });

        test("should execute plugin every time the dependency is requested, even in singleton scope", () => {
            container.get(A);
            container.get(A);
            container.get(A);
            expect(plugin).toHaveBeenCalledTimes(3);
            container.get(B);
            container.get(B);
            container.get(B);
            expect(plugin).toHaveBeenCalledTimes(6);
        });
    });

    describe("the plugin should be able to", () => {
        let resolved: TestClass;
        const fakeTarget = class {};
        const fakeTags = [NOCACHE];

        beforeEach(() => {
            container.bind(A).to(TestClass);
            container.addPlugin(plugin);
            resolved = container.get(A, fakeTags, fakeTarget);
        });

        test("access the dependency (1st argument)", () => {
            expect(plugin.mock.calls[0][0]).toBe(resolved);
        });

        test("access the arguments (5th argument)", () => {
            expect(plugin.mock.calls[0][2].indexOf(NOCACHE)).not.toBe(-1);
        });

        test("access the target (2nd argument)", () => {
            expect(plugin.mock.calls[0][1]).toBe(fakeTarget);
        });

        test("access the token (3th argument)", () => {
            expect(plugin.mock.calls[0][3]).toBe(A);
        });

        test("access the container (4th argument)", () => {
            expect(plugin.mock.calls[0][4]).toBe(container);
        });
    });
});
