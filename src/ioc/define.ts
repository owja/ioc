import {Container} from "./container";
import {NOCACHE} from "./tags";
import type {MaybeToken} from "./types";

export function define<T, Target extends {[key in Prop]: T}, Prop extends keyof Target>(
    target: Target,
    property: Prop,
    container: Container,
    token: MaybeToken<T>,
    tags: symbol[],
) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get<T>(token, tags, this);
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
