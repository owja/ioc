import {Container} from "./container";
import {NOCACHE} from "./tags";
import type {MaybeToken} from "./types";

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, ...tags: symbol[]) => {
        let value: T;
        return function (this: unknown): T {
            if (tags.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token, tags, this);
            }
            return value;
        };
    };
}
