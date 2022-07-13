import type { MaybeToken, Token } from "./types";

export function token<T>(name: string) {
    return {type: Symbol(name)} as Token<T>;
}

function isToken<T>(token: MaybeToken<T>): token is Token<T> {
    return typeof token != "symbol";
}

export function stringifyToken(token: MaybeToken): string {
    return isToken(token)
        ? `Token(${token.type.toString()})`
        : token.toString();
}

export function getType(token: MaybeToken): symbol {
    return isToken(token)
        ? token.type
        : token;
}