import {Container} from "./container";
import {define} from "./define";
import {MaybeToken} from "./token";

export function createDecorator(container: Container) {
    return <T>(token: MaybeToken<T>, ...args: MaybeToken[]) => {
        return <Target extends {[key in Prop]: T}, Prop extends string>(target: Target, property: Prop): void => {
            define(target, property, container, token, args);
        };
    };
}
