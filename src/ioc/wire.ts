import {Container} from "./container";
import {define} from "./define";
import type {MaybeToken} from "./types";

export function createWire(container: Container) {
    return <Value, Target extends {[key in Prop]: Value}, Prop extends string>(
        target: Target,
        property: Prop,
        token: MaybeToken<Value>,
        ...tags: symbol[]
    ) => {
        define(target, property, container, token, tags);
    };
}
