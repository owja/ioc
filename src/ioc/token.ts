import type { MaybeToken, Token } from "./types";

export function token<T>(name: string) {
    return {type: Symbol(name)} as Token<T>;
}

function isToken<T>(token: MaybeToken<T>): token is Token<T> {
    return typeof token != "symbol";
}

export function stringifyToken(token: MaybeToken): string {
    if (isToken(token)) {
        return `Token(${token.type.toString()})`;
    } else {
        return token.toString();
    }
}

export function getType(token: MaybeToken): symbol {
    if (isToken(token)) {
        return token.type;
    } else {
        return token;
    }
}
