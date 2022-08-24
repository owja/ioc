import {Container, token, createDecorator, createResolve, createWire, NOCACHE, NOPLUGINS, setBindedArguments} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {token as tokenOriginal} from "./ioc/token";
import {createDecorator as createDecoratorOriginal} from "./ioc/createDecorator";
import {createWire as createWireOriginal} from "./ioc/createWire";
import {createResolve as createResolveOriginal} from "./ioc/createResolve";
import {NOCACHE as NOCACHEOriginal, NOPLUGINS as NOPLUGINSOriginal} from "./ioc/tags";
import {setBindedArguments as setBindedArgumentsOriginal} from "./ioc/types";

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

    test('should export "setBindedArguments" function', () => {
        expect(setBindedArguments).toBe(setBindedArgumentsOriginal);
    });
});
