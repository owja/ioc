import {Container} from "./container";
import {define} from "./define";

export function createWire(container: Container) {
    return <T>(target: T, property: keyof T, type: symbol, ...args: symbol[]) => {
        define(target, property, container, type, args);
    };
}
