import type { Container } from "./container";

// container
export interface Item<T> {
  factory?: Factory<T>;
  value?: Value<T>;
  cache?: T;
  singleton?: boolean;
  plugins: Plugin<T>[];
}

export type Plugin<Dependency = any, Target = any> = (
  dependency: Dependency,
  target: Target | undefined,
  args: symbol[],
  token: MaybeToken<Dependency>,
  container: Container,
) => void;

export interface NewAble<T> {
  new (...args: any[]): T;
}

export type Registry = Map<symbol, Item<any>>;

export type Factory<T> = () => T;
export type Value<T> = T;

// tokens
export type MaybeToken<T = unknown> = Token<T> | symbol;

declare const typeMarker: unique symbol;
export interface Token<T> {
  type: symbol;
  [typeMarker]: T;
}