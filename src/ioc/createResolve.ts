import type {Token, MaybeToken} from "./types";
import type {Container} from "./container";
import {NOCACHE} from "./tags";
import {valueOrArrayToArray} from "./utils";

export function createResolve(container: Container) {
    return <T, U extends Array<unknown>>(token: Token<T, U> | MaybeToken<T>, tags: symbol[] | symbol = []) => {
        let value: T;
        return function <R>(this: R, ...injectedArgs: U): T {
            if (valueOrArrayToArray(tags).indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get(token, tags, this, injectedArgs);
            }
            return value;
        };
    };
}
