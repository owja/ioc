import {Container} from "./container";

export function inject<T>(type: symbol, container: Container) {

    return function(this: any, target: object, property: string): void {
        Object.defineProperty(target, property, {
            get: () => container.get<T>(type),
            enumerable: true,
        });
    };

}
