import {Container} from "./container";

export function inject<T>(type: symbol, container: Container) {

    return function(this: any, target: object, property: string): void {
        const getter = () => {
            return container.get<T>(type);
        };

        Object.defineProperty(target, property, {
            get: getter,
            enumerable: true,
            configurable: true
        });
    };

}
