import {Container} from "./container";
import {NOCACHE} from "./symbol";

export function define<T>(target: T, property: keyof T, container: Container, type: symbol, args: symbol[]) {
    Object.defineProperty(target, property, {
        get: function () {
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
