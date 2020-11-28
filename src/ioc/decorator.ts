import {Container} from "./container";
import {define} from "./define";
import {MaybeToken} from "./token";

export function createDecorator(container: Container) {
    return <T>(token: MaybeToken<T>, ...args: MaybeToken[]) => {
        return <TTarget extends {[key in TProp]: T}, TProp extends string>(target: TTarget, property: TProp): void => {
            define(target, property, container, token, args);
        };
    };
}
