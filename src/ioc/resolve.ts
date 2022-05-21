import {Container} from "./container";
import {NOCACHE} from "./symbol";

export function createResolve(container: Container) {
    return <T = unknown>(type: symbol, ...args: symbol[]) => {
        let value: T;
        return (): T => {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(type);
            }
            return value;
        };
    };
}
