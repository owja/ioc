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
    new (...args: unknown[]): T;
}

export type Factory<T> = () => T;
export type Value<T> = T;

// tokens
export type MaybeToken<T = unknown> = Token<T> | symbol;

declare const typeMarker: unique symbol;
export interface Token<T> {
    type: symbol;
    [typeMarker]: T;
}
