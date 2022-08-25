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
    tags: symbol[],
    token: MaybeToken<Dependency>,
    container: Container,
) => void;

export interface NewAble<T> {
    new (...ctorArgs: any[]): T;
}

export type Factory<T> = (...factoryArgs: any) => T;
export type Value<T> = T;

// tokens
export type MaybeToken<T = unknown> = Token<T> | symbol;

declare const typeMarker: unique symbol;
export interface Token<T> {
    type: symbol;
    [typeMarker]: T;
}

declare const bindedArguments: unique symbol;
export type BindedToken<T, U> = U extends Array<unknown> ? Token<T> & {[bindedArguments]: U} : Token<T>;

// compiles to empty function
export function setBindedArguments<T, U>(token: MaybeToken<T>): asserts token is BindedToken<T, U> {
    token;
}
