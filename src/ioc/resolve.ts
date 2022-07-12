import {Container} from "./container";
import {NOCACHE} from "./symbol";
import {MaybeToken} from "./token";

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, args: symbol[]) => {
        let value: T;
        return function <K extends Array<unknown> = never> (this: unknown, ...ctorArgs: K): T {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token, args, this, ctorArgs);
            }
            return value;
        };
    };
}
