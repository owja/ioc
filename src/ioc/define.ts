import type {MaybeToken} from "./types";
import {Container} from "./container";
import {NOCACHE} from "./tags";

export function define<T, Target extends {[key in Prop]: T}, Prop extends keyof Target, K extends Array<unknown>>(
    target: Target,
    property: Prop,
    container: Container,
    token: MaybeToken<T>,
    tags: symbol[],
    ...ctorArgs: K
) {
    Object.defineProperty(target, property, {
        get: function <R>(this: R): T {
            const value = container.get<T>(token, tags, this, ctorArgs);
            if (tags.indexOf(NOCACHE) === -1)
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}
