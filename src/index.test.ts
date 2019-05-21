import {Container, createDecorator} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {createDecorator as createDecoratorOriginal} from "./ioc/inject";

describe("Module", () => {
    test('should export "Container" class', () => {
        expect(Container).toEqual(ContainerOriginal);
    });

    test('should export "createDecorator" function', () => {
        expect(createDecorator).toEqual(createDecoratorOriginal);
    });
});
