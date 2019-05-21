import {Container} from "./container";

function inject(type: symbol, container: Container) {
    return function(target: object, property: string): void {
        Object.defineProperty(target, property, {
            get: () => container.get<any>(type),
            enumerable: true,
        });
    };
}

export function createDecorator(container: Container) {
    return function(type: symbol) {
        return inject(type, container);
    };
}
