import type {BindedToken, MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createDecorator(container: Container) {
    return <T, K extends Array<unknown>>(token: BindedToken<T, K> | MaybeToken<T>, tags: symbol[] = [], ...injectedArgs: K) => {
        return function <Target extends {[key in Prop]: T}, Prop extends keyof Target>(
            target: Target,
            property: Prop,
        ): void {
            define(target, property, container, token, tags, ...injectedArgs);
        };
    };
}
