import type {MaybeToken} from "./types";
import type {Container} from "./container";
import {NOCACHE} from "./tags";

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, tags: symbol[] = []) => {
        let value: T;
        return function <R, K extends Array<unknown>>(this: R, ...ctorArgs: K): T {
            if (tags.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token, tags, this, ctorArgs);
            }
            return value;
        };
    };
}
