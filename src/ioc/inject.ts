import {Container} from "./container";

export const NOCACHE = Symbol("NOCACHE");
export const LINK = Symbol("LINK");

interface ISubscribable {
    [name: string]: (callback: () => void) => () => void | any;
}

interface IListener {
    [name: string]: () => void | any;
}

function link(listener: IListener, subscribable: ISubscribable, container: Container, type: symbol) {
    const config = container.getLinkConfig(type);
    if (!config) return;
    if (typeof subscribable[config.to] !== "function") return;
    if (typeof listener[config.action] !== "function") return;

    const unsubscribe = subscribable.listen(() => listener[config.action]());
    if (typeof unsubscribe !== "function") return;

    if (typeof listener[config.unlink] === "function") {
        const unlink = listener[config.unlink];
        listener[config.unlink] = () => {
            unlink();
            unsubscribe();
        };
    } else {
        listener[config.unlink] = unsubscribe;
    }
}

function define(target: object, property: string, container: Container, type: symbol, args: symbol[]) {
    Object.defineProperty(target, property, {
        get: function() {
            const value = container.get<any>(type);
            if (args.indexOf(LINK) !== -1) link(this, value, container, type);
            if (args.indexOf(NOCACHE) === -1) {
                Object.defineProperty(this, property, {
                    value,
                    enumerable: true,
                });
            }
            return value;
        },
        configurable: true,
        enumerable: true,
    });
}

function inject(type: symbol, container: Container, args: symbol[]) {
    return function(target: object, property: string): void {
        define(target, property, container, type, args);
    };
}

export function createDecorator(container: Container) {
    return function(type: symbol, ...args: symbol[]) {
        return inject(type, container, args);
    };
}

export function createWire(container: Container) {
    return function<T extends object>(target: T, property: keyof T & string, type: symbol, ...args: symbol[]) {
        define(target, property, container, type, args);
    };
}
