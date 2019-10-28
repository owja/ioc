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

    bind<T = never>(type: symbol): Bind<T> {
        return new Bind<T>(this._add<T>(type));
    }

    rebind<T = never>(type: symbol): Bind<T> {
        return this.remove(type).bind<T>(type);
    }

    remove(type: symbol): Container {
        if (this._registry.get(type) === undefined) {
            throw `nothing is bound to ${type.toString()}`;
        }

        this._registry.delete(type);

        return this;
    }

    get<T = never>(type: symbol): T {
        const regItem = this._registry.get(type);

        if (regItem === undefined) {
            throw `nothing is bound to ${type.toString()}`;
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

        throw `nothing is bound to ${type.toString()}`;
    }

    snapshot(): Container {
        this._snapshots.push(new Map(this._registry));
        return this;
    }

    restore(): Container {
        this._registry = this._snapshots.pop() || this._registry;
        return this;
    }

    private _add<T>(type: symbol): IConfig<T> {
        if (this._registry.get(type) !== undefined) {
            throw `object can only bound once: ${type.toString()}`;
        }

        const conf = {singleton: false};
        this._registry.set(type, conf);

        return conf;
    }
}
