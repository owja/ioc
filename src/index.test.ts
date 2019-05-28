import {Container, createDecorator, NOCACHE} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {createDecorator as createDecoratorOriginal, NOCACHE as NOCACHEOriginal} from "./ioc/inject";

describe("Module", () => {
    test('should export "Container" class', () => {
        expect(Container).toBe(ContainerOriginal);
    });

    test('should export "createDecorator" function', () => {
        expect(createDecorator).toBe(createDecoratorOriginal);
    });

    test('should export "NOCACHE" symbol/tag', () => {
        expect(NOCACHE).toBe(NOCACHEOriginal);
    });
});
