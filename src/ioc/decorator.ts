import {Container} from "./container";
import {define} from "./define";
import {MaybeToken} from "./token";

export function createDecorator(container: Container) {
    return <T, K extends Array<unknown>>(token: MaybeToken<T>, args: symbol[] = [], ...ctorArgs: K) => {
        return <Target extends {[key in Prop]: T}, Prop extends string>(target: Target, property: Prop): void => {
            define(target, property, container, token, args, ...ctorArgs);
        };
    };
}
