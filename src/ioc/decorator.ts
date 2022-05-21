import {Container} from "./container";
import {define} from "./define";

export function createDecorator(container: Container) {
    return (type: symbol, ...args: symbol[]) => {
        return <T>(target: T, property: keyof T): void => {
            define(target, property, container, type, args);
        };
    };
}
