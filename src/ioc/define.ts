import {Container} from "./container";
import {NOCACHE} from "./symbol";
import type {MaybeToken} from "./types";

export function define<T, Target extends {[key in Prop]: T}, Prop extends string>(
    target: Target,
    property: Prop,
    container: Container,
    token: MaybeToken<T>,
    args: symbol[],
) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get<any>(token, args, this);
            if (args.indexOf(NOCACHE) === -1) {
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            }
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}
