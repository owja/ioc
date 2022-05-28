import {getType, MaybeToken, stringifyToken} from "./token";

interface Item<T> {
    factory?: Factory<T>;
    value?: Value<T>;
    cache?: T;
    singleton?: boolean;
}

interface NewAble<T> {
    new (...args: any[]): T;
}

type Registry = Map<symbol, Item<any>>;

type Factory<T> = () => T;
type Value<T> = T;

class Options<T> {
    constructor(private _target: Item<T>) {}

    inSingletonScope() {
        this._target.singleton = true;
    }
}

class Bind<T> {
    constructor(private _target: Item<T>) {}

    to(object: NewAble<T>): Options<T> {
        this._target.factory = () => new object();
        return new Options<T>(this._target);
    }

    toFactory(factory: Factory<T>): Options<T> {
        this._target.factory = factory;
        return new Options<T>(this._target);
    }

    toValue(value: Value<T>): void {
        if (typeof value === "undefined") {
            throw "cannot bind a value of type undefined";
        }
        this._target.value = value;
    }
}

export class Container {
    private _registry: Registry = new Map<symbol, Item<any>>();
    private _snapshots: Registry[] = [];

    bind<T = never>(token: MaybeToken<T>): Bind<T> {
        return new Bind<T>(this._create<T>(token));
    }

    rebind<T = never>(token: MaybeToken<T>): Bind<T> {
        return this.remove(token).bind<T>(token);
    }

    remove(token: MaybeToken): Container {
        if (this._registry.get(getType(token)) === undefined) {
            throw `${stringifyToken(token)} was never bound`;
        }

        this._registry.delete(getType(token));

        return this;
    }

    get<T = never>(token: MaybeToken<T>): T {
        const item = this._registry.get(getType(token));

        if (item === undefined) {
            throw `nothing bound to ${stringifyToken(token)}`;
        }

        const {factory, value, cache, singleton} = item;

        const cacheItem = (creator: () => T): T => {
            if (singleton && typeof cache !== "undefined") return cache;
            if (!singleton) return creator();
            item.cache = creator();
            return item.cache;
        };

        if (typeof value !== "undefined") return value;
        if (typeof factory !== "undefined") return cacheItem(() => factory());

        throw `nothing is bound to ${stringifyToken(token)}`;
    }

    snapshot(): Container {
        this._snapshots.push(new Map(this._registry));
        return this;
    }

    restore(): Container {
        this._registry = this._snapshots.pop() || this._registry;
        return this;
    }

    private _create<T>(token: MaybeToken<T>): Item<T> {
        if (this._registry.get(getType(token)) !== undefined) {
            throw `object can only bound once: ${stringifyToken(token)}`;
        }

        const item = {};
        this._registry.set(getType(token), item);

        return item;
    }
}
