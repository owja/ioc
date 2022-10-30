import type {MaybeToken, Token} from "./types";
import {isSymbol} from "./utils";

export const token = <T, U extends Array<unknown> = unknown[]>(name: string) => ({type: Symbol(name)} as Token<T, U>);

export const stringifyToken = (token: MaybeToken): string =>
    !isSymbol(token) ? `Token(${token.type.toString()})` : token.toString();

export const getType = (token: MaybeToken): symbol => (!isSymbol(token) ? token.type : token);
