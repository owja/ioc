import type {Token, MaybeToken} from "./types";
import {Container} from "./container";
import {NOCACHE} from "./tags";
import {valueOrArrayToArray} from "./utils";

export function define<T, Target extends {[key in Prop]: T}, Prop extends keyof Target, K extends Array<unknown>>(
    target: Target,
    property: Prop,
    container: Container,
    token: Token<T, K> | MaybeToken<T>,
    tags: symbol[] | symbol,
    ...injectedArgs: K
) {
    Object.defineProperty(target, property, {
        get: function <R>(this: R): T {
            const value = container.get(token, tags, this, injectedArgs);
            if (valueOrArrayToArray(tags).indexOf(NOCACHE) === -1)
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
