export const isSymbol = (t: unknown): t is symbol => typeof t == "symbol";

export const valueOrArrayToArray = (smt: symbol[] | symbol): symbol[] => (isSymbol(smt) ? [smt] : smt);
