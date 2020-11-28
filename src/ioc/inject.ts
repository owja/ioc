import {Container} from "./container";
import {MaybeToken} from "./token";

export const NOCACHE = Symbol("NOCACHE");

function define<TVal, TTarget extends {[key in TProp]: TVal}, TProp extends string>(
    target: TTarget,
    property: TProp,
    container: Container,
    token: MaybeToken<TVal>,
    argTokens: MaybeToken[],
) {
    Object.defineProperty(target, property, {
        get: function () {
            const value = container.get<any>(token);
            if (argTokens.indexOf(NOCACHE) === -1) {
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            }
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}

function inject<T>(token: MaybeToken<T>, container: Container, args: MaybeToken[]) {
    return <TTarget extends {[key in TProp]: T}, TProp extends string>(target: TTarget, property: TProp): void => {
        define(target, property, container, token, args);
    };
}

export function createDecorator(container: Container) {
    return <T>(token: MaybeToken<T>, ...args: MaybeToken[]) => {
        return inject(token, container, args);
    };
}

export function createWire(container: Container) {
    return <TVal, TTarget extends {[key in TProp]: TVal}, TProp extends string>(
        target: TTarget,
        property: TProp,
        token: MaybeToken<TVal>,
        ...args: MaybeToken[]
    ) => {
        define(target, property, container, token, args);
    };
}

export function createResolve(container: Container) {
    return <T = never>(token: MaybeToken<T>, ...args: MaybeToken[]) => {
        let value: T;
        return (): T => {
            if (args.indexOf(NOCACHE) !== -1 || value === undefined) {
                value = container.get<T>(token);
            }
            return value;
        };
    };
}
