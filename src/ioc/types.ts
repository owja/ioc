import type {Container} from "./container";

// container
export type Injected<T> = Factory<T> | Value<T>;
export interface Item<T> {
    injected?: Injected<T>;
    cache?: T;
    singleton?: boolean;
    plugins: Plugin<T>[];
}

export type Plugin<Dependency = unknown> = (
    dependency: Dependency,
    target: unknown,
    tags: symbol[] | symbol,
    token: MaybeToken<Dependency>,
    container: Container,
) => void;

export interface NewAble<T> {
    new (...ctorArgs: any[]): T;
}

export type Factory<T, U extends Array<unknown> = any> = (...factoryArgs: U) => T;
export type Value<T> = T;

// tokens
export type MaybeToken<T = unknown, U extends Array<unknown> = unknown[]> = Token<T, U> | symbol;

declare const typeMarker: unique symbol;
declare const bindedArguments: unique symbol;
export interface Token<T, U extends Array<unknown>> {
    type: symbol;
    [typeMarker]: T;
    [bindedArguments]: U;
}
