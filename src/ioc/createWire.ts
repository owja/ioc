import type {MaybeToken} from "./types";
import type {Container} from "./container";
import {define} from "./define";

export function createWire(container: Container) {
    return <Value, Target extends {[key in Prop]: Value}, Prop extends keyof Target>(
        target: Target,
        property: Prop,
        token: MaybeToken<Value>,
        ...tags: symbol[]
    ) => {
        define(target, property, container, token, tags);
    };
}
