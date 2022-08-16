import type {MaybeToken, Token} from "./types";

export const token = <T>(name: string) => ({type: Symbol(name)} as Token<T>);

const isToken = <T>(token: MaybeToken<T>): token is Token<T> => typeof token != "symbol";

export const stringifyToken = (token: MaybeToken): string =>
    isToken(token) ? `Token(${token.type.toString()})` : token.toString();

export const getType = (token: MaybeToken): symbol => (isToken(token) ? token.type : token);
