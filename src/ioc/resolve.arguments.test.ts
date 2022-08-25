import {Container} from "./container";

import {token} from "./token";

import {createResolve} from "./createResolve";
import { setBindedArguments } from "./types";

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
    classWithArguments: token<WithArguments>("classWithArguments"),
    classWithoutArguments: token<WithoutArguments>("classWithoutArguments"),
    factoryWithArguments: token<WithArguments>("factoryWithArguments"),
    factoryWithoutArguments: token<WithoutArguments>("factoryWithoutArguments"),
};
const typeSafeToken = token<WithArguments>("typeSafeToken");

const factory = (a: number, b: number) => new WithArguments(a, b);
const container = new Container();
container.bind(TYPE.classWithArguments).to(WithArguments);
container.bind(TYPE.classWithoutArguments).to(WithoutArguments);
container.bind(TYPE.factoryWithArguments).toFactory(factory);
container.bind(TYPE.factoryWithoutArguments).toFactory(() => new WithoutArguments());
container.bind(typeSafeToken).to(WithArguments);
setBindedArguments<WithArguments, ConstructorParameters<typeof WithArguments>>(typeSafeToken);
const resolve = createResolve(container);

class ResolveTest {
    classWithArguments = resolve(TYPE.classWithArguments);
    classWithArgumentsTypeSafe = resolve<WithArguments, ConstructorParameters<typeof WithArguments>>(TYPE.classWithArguments);
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

    test("resolves type safe token", () => {
        const typeSafeResolve = resolve(typeSafeToken);
        const resolved = typeSafeResolve(1, 2); // only accepts two numbers
        expect(resolved.a).toEqual(1);
        expect(resolved.b).toEqual(2);
    });
});
