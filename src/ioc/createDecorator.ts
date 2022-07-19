import type {MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createDecorator(container: Container) {
    return <T>(token: MaybeToken<T>, ...tags: symbol[]) => {
        return function <Target extends {[key in Prop]: T}, Prop extends keyof Target>(target: Target, property: Prop): void {
            define(target, property, container, token, tags);
        };
    };
}
