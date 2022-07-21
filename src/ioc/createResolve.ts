import type {MaybeToken} from "./types";
import type {Container} from "./container";
import {NOCACHE} from "./tags";

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, ...tags: symbol[]) => {
        let value: T;
        return function <R>(this: R): T {
            if (tags.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token, tags, this);
            }
            return value;
        };
    };
}
