import type {Token, MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createDecorator(container: Container) {
    return <Dep, Args extends Array<unknown>>(
        token: Token<Dep, Args> | MaybeToken<Dep>,
        tags: symbol[] | symbol = [],
        ...args: Args
    ) => {
        return function <Target extends {[key in Prop]: Dep}, Prop extends keyof Target>(
            target: Target,
            property: Prop,
        ): void {
            define(target, property, container, token, tags, ...args);
        };
    };
}
