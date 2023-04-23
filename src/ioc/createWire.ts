import type {Token, MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createWire(container: Container) {
    return <Dep, Target extends {[key in Prop]: Dep}, Prop extends keyof Target, Args extends Array<unknown>>(
        target: Target,
        property: Prop,
        token: Token<Dep, Args> | MaybeToken<Dep>,
        tags: symbol[] | symbol = [],
        ...args: Args
    ) => {
        define(target, property, container, token, tags, args);
    };
}
