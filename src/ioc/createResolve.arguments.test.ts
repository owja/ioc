import {Container} from "./container";

import {token} from "./token";

import {createResolve} from "./createResolve";

class WithArguments {
    constructor(public a: number, public b: number) {}
}
class WithoutArguments {
    public a: number;
    constructor() {
        this.a = 1;
    }
}

const TYPE = {
    classWithArguments: token<WithArguments, ConstructorParameters<typeof WithArguments>>("classWithArguments"),
    classWithoutArguments: token<WithoutArguments>("classWithoutArguments"),
    factoryWithArguments: token<WithArguments, Parameters<typeof factory>>("factoryWithArguments"),
    factoryWithoutArguments: token<WithoutArguments>("factoryWithoutArguments"),
};

const factory = (a: number, b: number) => new WithArguments(a, b);
const container = new Container();
container.bind(TYPE.classWithArguments).to(WithArguments);
container.bind(TYPE.classWithoutArguments).to(WithoutArguments);
container.bind(TYPE.factoryWithArguments).toFactory(factory);
container.bind(TYPE.factoryWithoutArguments).toFactory(() => new WithoutArguments());
const resolve = createResolve(container);

class ResolveTest {
    classWithArguments = resolve(TYPE.classWithArguments);
    classWithArgumentsTypeSafe = resolve(TYPE.classWithArguments);
    classWithoutArguments = resolve(TYPE.classWithoutArguments);
    factoryWithArguments = resolve(TYPE.factoryWithArguments);
    factoryWithoutArguments = resolve(TYPE.factoryWithoutArguments);
}

describe("Resolve", () => {
    test("resolves class with constructor arguments", () => {
        const resolveTest = new ResolveTest();
        const resolved = resolveTest.classWithArguments(1, 2);
        expect(resolved.a).toEqual(1);
        expect(resolved.b).toEqual(2);

        // type safe
        const resolvedTypeSafe = resolveTest.classWithArgumentsTypeSafe(1, 2); // only accepts two numbers
        expect(resolvedTypeSafe.a).toEqual(1);
        expect(resolvedTypeSafe.b).toEqual(2);
    });

    test("resolves class without constructor arguments", () => {
        const resolveTest = new ResolveTest();
        const resolved = resolveTest.classWithoutArguments();
        expect(resolved.a).toEqual(1);
    });

    test("resolves factory with constructor arguments", () => {
        const resolveTest = new ResolveTest();
        const resolved = resolveTest.factoryWithArguments(1, 2);
        expect(resolved.a).toEqual(1);
        expect(resolved.b).toEqual(2);
    });

    test("resolves factory without constructor arguments", () => {
        const resolveTest = new ResolveTest();
        const resolved = resolveTest.factoryWithoutArguments();
        expect(resolved.a).toEqual(1);
    });
});
