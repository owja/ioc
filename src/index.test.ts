import {Container, createDecorator, createResolve, createWire, NOCACHE} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {
    createDecorator as createDecoratorOriginal,
    createResolve as createResolveOriginal,
    createWire as createWireOriginal,
    NOCACHE as NOCACHEOriginal,
} from "./ioc/inject";

describe("Module", () => {
    test('should export "Container" class', () => {
        expect(Container).toBe(ContainerOriginal);
    });

    test('should export "createDecorator" function', () => {
        expect(createDecorator).toBe(createDecoratorOriginal);
    });

    test('should export "createResolve" function', () => {
        expect(createResolve).toBe(createResolveOriginal);
    });

    test('should export "createWire" function', () => {
        expect(createWire).toBe(createWireOriginal);
    });

    test('should export "NOCACHE" symbol/tag', () => {
        expect(NOCACHE).toBe(NOCACHEOriginal);
    });
});
