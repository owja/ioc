import {Container} from "./container";

export const NOCACHE = Symbol("NOCACHE");
export const SUBSCRIBE = Symbol("SUBSCRIBE");

interface ISubscribable {
    [name: string]: (callback: () => void) => () => void | any;
}

interface IListener {
    [name: string]: () => void | any;
}

/**
 * Just a dirty hard coded implementation
 */
function subscribe(listener: IListener, subscribable: ISubscribable) {
    if (typeof subscribable["listen"] !== "function") return;
    if (typeof listener["forceUpdate"] !== "function") return;

    const unsubscribe = subscribable.listen(() => listener.forceUpdate());

    if (typeof listener["componentWillUnmount"] === "function") {
        const unmount = listener["componentWillUnmount"];
        listener["componentWillUnmount"] = () => {
            unmount();
            unsubscribe();
        };
    } else {
        listener["componentWillUnmount"] = unsubscribe;
    }
}

function define(target: object, property: string, container: Container, type: symbol, args: symbol[]) {
    Object.defineProperty(target, property, {
        get: function() {
            const value = container.get<any>(type);
            if (args.indexOf(SUBSCRIBE) !== -1) subscribe(this, value);
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
