import {Container} from "./container";
import {define} from "./define";
import {MaybeToken} from "./token";

export function createWire(container: Container) {
    return <TVal, TTarget extends {[key in TProp]: TVal}, TProp extends string>(
        target: TTarget,
        property: TProp,
        token: MaybeToken<TVal>,
        ...args: MaybeToken[]
    ) => {
        define(target, property, container, token, args);
    };
}
