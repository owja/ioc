import type {Token, MaybeToken} from "./types";
import {Container} from "./container";
import {NOCACHE} from "./tags";
import {valueOrArrayToArray} from "./utils";

export function define<
    Dep,
    Target extends {[key in Prop]: Dep},
    Prop extends keyof Target,
    Args extends Array<unknown>,
>(
    target: Target,
    property: Prop,
    container: Container,
    token: Token<Dep, Args> | MaybeToken<Dep>,
    tags: symbol[] | symbol,
    args: Args,
) {
    Object.defineProperty(target, property, {
        get: function <R>(this: R): Dep {
            const value = container.get(token, tags, this, args);
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
