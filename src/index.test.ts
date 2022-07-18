import {Container, token, createDecorator, createResolve, createWire, NOCACHE, NOPLUGINS} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {token as tokenOriginal} from "./ioc/token";
import {createDecorator as createDecoratorOriginal} from "./ioc/decorator";
import {createWire as createWireOriginal} from "./ioc/wire";
import {createResolve as createResolveOriginal} from "./ioc/resolve";
import {NOCACHE as NOCACHEOriginal, NOPLUGINS as NOPLUGINSOriginal} from "./ioc/tags";

describe("Module", () => {
    test('should export "Container" class', () => {
        expect(Container).toBe(ContainerOriginal);
    });

    test('should export "token" function', () => {
        expect(token).toBe(tokenOriginal);
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

    test('should export "NOPLUGINS" symbol/tag', () => {
        expect(NOPLUGINS).toBe(NOPLUGINSOriginal);
    });
});
