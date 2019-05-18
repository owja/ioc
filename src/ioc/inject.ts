import {Container} from "./container";

export function inject<T>(type: Symbol, container: Container) {

    return function(this: any, target: Object, property: string): void {
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
