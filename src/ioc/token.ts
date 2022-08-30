import type {MaybeToken, Token} from "./types";

export const token = <T, U extends Array<unknown> = unknown[]>(name: string) => ({type: Symbol(name)} as Token<T, U>);

const isToken = <T, U extends Array<unknown>>(token: MaybeToken<T, U>): token is Token<T, U> => typeof token != "symbol";

export const stringifyToken = (token: MaybeToken): string =>
    isToken(token) ? `Token(${token.type.toString()})` : token.toString();

export const getType = (token: MaybeToken): symbol => (isToken(token) ? token.type : token);
