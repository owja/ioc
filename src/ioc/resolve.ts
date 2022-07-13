import {Container} from "./container";
import {NOCACHE} from "./symbol";
import type {MaybeToken} from "./types";

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, ...args: symbol[]) => {
        let value: T;
        return function (this: unknown): T {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token, args, this);
            }
            return value;
        };
    };
}
