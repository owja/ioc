import {Container} from "./container";

export const NOCACHE = Symbol.for("NOCACHE");

function inject(type: symbol, container: Container, args?: symbol[]) {
    return function(target: object, property: string): void {
        Object.defineProperty(target, property, {
            get: function() {
                const value = container.get<any>(type);
                if (args && args.indexOf(NOCACHE)) {
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
    };
}

export function createDecorator(container: Container) {
    return function(type: symbol, ...args: symbol[]) {
        return inject(type, container, args);
    };
}
