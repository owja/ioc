import {Container} from "./container";

function inject(type: symbol, container: Container) {
    return function(target: object, property: string): void {
        Object.defineProperty(target, property, {
            get: function() {
                const value = container.get<any>(type);
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
                return value;
            },
            configurable: true,
            enumerable: true,
        });
    };
}

export function createDecorator(container: Container) {
    return function(type: symbol) {
        return inject(type, container);
    };
}
