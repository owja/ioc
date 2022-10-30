import type {Token, MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createWire(container: Container) {
    return <Value, Target extends {[key in Prop]: Value}, Prop extends keyof Target, K extends Array<unknown>>(
        target: Target,
        property: Prop,
        token: Token<Value, K> | MaybeToken<Value>,
        tags: symbol[] = [],
        ...injectedArgs: K
    ) => {
        define(target, property, container, token, tags, ...injectedArgs);
    };
}
