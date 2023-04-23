import type {Container} from "./container";

export interface RegItem<Dep = unknown, Args extends Array<unknown> = []> {
    value?: Value<Dep>;
    factory?: Factory<Dep, Args>;
    cache?: Dep;
    singleton?: boolean;
    plugins: Plugin<Dep>[];
}

export type Plugin<Dep = unknown> = (
    dependency: Dep,
    target: unknown,
    tags: symbol[],
    token: MaybeToken<Dep>,
    container: Container,
) => void;

export interface NewAble<Dep, Args extends Array<unknown>> {
    new (...args: Args): Dep;
}

export type Factory<Dep, Args extends Array<unknown>> = (...args: Args) => Dep;
export type Value<Dependency> = Dependency;

// tokens
export type MaybeToken<Dep = unknown, Args extends Array<unknown> = unknown[]> = Token<Dep, Args> | symbol;

declare const dependencyMarker: unique symbol;
declare const argumentsMarker: unique symbol;
export interface Token<Dep, Args extends Array<unknown> = never> {
    type: symbol;
    [dependencyMarker]: Dep;
    [argumentsMarker]: Args;
}
