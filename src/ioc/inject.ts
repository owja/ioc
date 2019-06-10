import {Container} from "./container";

export const NOCACHE = Symbol("NOCACHE");

function define(target: object, property: string, container: Container, type: symbol, args: symbol[]) {
    Object.defineProperty(target, property, {
        get: function() {
            const value = container.get<any>(type);
            if (args.indexOf(NOCACHE) === -1) {
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            }
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}

function inject(type: symbol, container: Container, args: symbol[]) {
    return function(target: object, property: string): void {
        define(target, property, container, type, args);
    };
}

export function createDecorator(container: Container) {
    return function(type: symbol, ...args: symbol[]) {
        return inject(type, container, args);
    };
}

export function createWire(container: Container) {
    return function<T extends object>(target: T, property: keyof T & string, type: symbol, ...args: symbol[]) {
        define(target, property, container, type, args);
    };
}

export function createResolve(container: Container) {
    return function<T = never>(_target: any, type: symbol, ...args: symbol[]) {
        // `target` will get used in the Subscribable proposal. Reserving it.
        let value: T;
        return (): T => {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(type);
            }
            return value;
        };
    };
}
