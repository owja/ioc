import {Container} from "./container";
import {NOCACHE} from "./symbol";
import {MaybeToken} from "./token";

export function define<TVal, TTarget extends {[key in TProp]: TVal}, TProp extends string>(
    target: TTarget,
    property: TProp,
    container: Container,
    token: MaybeToken<TVal>,
    argTokens: MaybeToken[],
) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get<any>(token, argTokens, target);
            if (argTokens.indexOf(NOCACHE) === -1) {
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
