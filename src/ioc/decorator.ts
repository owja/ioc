import {Container} from "./container";
import {define} from "./define";
import type {MaybeToken} from "./types";

export function createDecorator(container: Container) {
    return <T>(token: MaybeToken<T>, ...tags: symbol[]) => {
        return function <Target extends {[key in Prop]: T}, Prop extends string>(target: Target, property: Prop): void {
            define(target, property, container, token, tags);
        };
    };
}
