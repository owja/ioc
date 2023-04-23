import type {Token, MaybeToken} from "./types";
import type {Container} from "./container";
import {NOCACHE} from "./tags";
import {valueOrArrayToArray} from "./utils";

export function createResolve(container: Container) {
    return <Dep, Args extends Array<unknown>>(
        token: Token<Dep, Args> | MaybeToken<Dep>,
        tags: symbol[] | symbol = [],
    ) => {
        let value: Dep;
        return function <R>(this: R, ...args: Args): Dep {
            if (valueOrArrayToArray(tags).indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get(token, tags, this, args);
            }
            return value;
        };
    };
}
