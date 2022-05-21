import {Container, createDecorator, createResolve, createWire, NOCACHE} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {createDecorator as createDecoratorOriginal} from "./ioc/decorator";
import {createWire as createWireOriginal} from "./ioc/wire";
import {createResolve as createResolveOriginal} from "./ioc/resolve";
import {NOCACHE as NOCACHEOriginal} from "./ioc/symbol";

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
