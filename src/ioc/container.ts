import {getType, MaybeToken, stringifyToken} from "./token";

interface IConfig<T> {
    object?: INewAble<T>;
    factory?: Factory<T>;
    value?: Value<T>;
    cache?: T;
    singleton: boolean;
}

interface INewAble<T> {
    new (...args: any[]): T;
}

type Registry = Map<symbol, IConfig<any>>;

type Factory<T> = () => T;
type Value<T> = T;

class Options<T> {
    constructor(private _target: IConfig<T>) {}

    inSingletonScope() {
        this._target.singleton = true;
    }
}

class Bind<T> {
    constructor(private _target: IConfig<T>) {}

    to(object: INewAble<T>): Options<T> {
        this._target.object = object;
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
    private _registry: Registry = new Map<symbol, IConfig<any>>();
    private _snapshots: Registry[] = [];

    bind<T = never>(token: MaybeToken<T>): Bind<T> {
        return new Bind<T>(this._add<T>(token));
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
        const regItem = this._registry.get(getType(token));

        if (regItem === undefined) {
            throw `nothing bound to ${stringifyToken(token)}`;
        }

        const {object, factory, value, cache, singleton} = regItem;

        const cacheItem = (creator: () => T): T => {
            if (singleton && typeof cache !== "undefined") return cache;
            if (!singleton) return creator();
            regItem.cache = creator();
            return regItem.cache;
        };

        if (typeof value !== "undefined") return value;
        if (typeof object !== "undefined") return cacheItem(() => new object());
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

    private _add<T>(token: MaybeToken<T>): IConfig<T> {
        if (this._registry.get(getType(token)) !== undefined) {
            throw `object can only bound once: ${stringifyToken(token)}`;
        }

        const conf = {singleton: false};
        this._registry.set(getType(token), conf);

        return conf;
    }
}
