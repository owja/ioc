import {Container} from "./container";

import {token} from "./token";

import {createResolve} from "./resolve";

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

const container = new Container();
container.bind(TYPE.classWithArguments).to(WithArguments);
container.bind(TYPE.classWithoutArguments).to(WithoutArguments);
container.bind(TYPE.factoryWithArguments).toFactory((a: number, b: number) => new WithArguments(a, b));
container.bind(TYPE.factoryWithoutArguments).toFactory(() => new WithoutArguments());

const resolve = createResolve(container);

class ResolveTest {
  classWithArguments = resolve(TYPE.classWithArguments, []);
  classWithoutArguments = resolve(TYPE.classWithoutArguments, []);
  factoryWithArguments = resolve(TYPE.factoryWithArguments, []);
  factoryWithoutArguments = resolve(TYPE.factoryWithoutArguments, []);
}

describe("Resolve", () => {
  test("resolves class with constructor arguments", () => {
    const resolveTest = new ResolveTest();
    const resolved = resolveTest.classWithArguments<ConstructorParameters<typeof WithArguments>>(1, 2)
    expect(resolved.a).toEqual(1);
    expect(resolved.b).toEqual(2);
  });

  test("resolves class without constructor arguments", () => {
    const resolveTest = new ResolveTest();
    const resolved = resolveTest.classWithoutArguments<ConstructorParameters<typeof WithoutArguments>>()
    expect(resolved.a).toEqual(1);
  });

  test("resolves factory with constructor arguments", () => {
    const resolveTest = new ResolveTest();
    const resolved = resolveTest.factoryWithArguments<ConstructorParameters<typeof WithArguments>>(1, 2)
    expect(resolved.a).toEqual(1);
    expect(resolved.b).toEqual(2);
  });

  test("resolves factory without constructor arguments", () => {
    const resolveTest = new ResolveTest();
    const resolved = resolveTest.factoryWithoutArguments<ConstructorParameters<typeof WithoutArguments>>()
    expect(resolved.a).toEqual(1);
  });
});
