import type {MaybeToken, Token} from "./types";
import {isSymbol} from "./utils";

export const token = <Dep, Args extends Array<unknown> = unknown[]>(name: string) =>
    ({type: Symbol(name)} as Token<Dep, Args>);

export const stringifyToken = (token: MaybeToken): string =>
    !isSymbol(token) ? `Token(${token.type.toString()})` : token.toString();

export const getType = (token: MaybeToken): symbol => (!isSymbol(token) ? token.type : token);
