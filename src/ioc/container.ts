interface IConfig<T> {
    tags: string[];
    object?: INewAble<T>;
    factory?: Factory<T>;
    value?: Value<T>;
    cache?: T;
    singleton: boolean;
}

interface IRegistry {
    [type: string]: IConfig<any>;
}

interface INewAble<T> {
    new(...args: any[]): T;
}

type Factory<T> = () => T;
type Value<T> = T;

class Options<T> {

    constructor(
        private _target: IConfig<T>
    ) {};

    inSingletonScope() {
        this._target.singleton = true;
    }
}

class Bind<T> {

    constructor(
        private _target: IConfig<T>
    ) {};

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

    private _registry: IRegistry = {};
    private _snapshots: IRegistry[] = [];

    bind<T = never>(type: symbol): Bind<T> {
        return new Bind<T>(this._add<T>(type));
    }

    rebind<T = never>(type: symbol): Bind<T> {
        return this.remove(type).bind<T>(type);
    }

    remove(type: symbol): Container {
        if (!this._registry[type.toString()]) {
            throw `${type.toString()} was never bound`;
        }

        delete this._registry[type.toString()];

        return this;
    }

    get<T = never>(type: symbol): T {
        if (!this._registry[type.toString()]) {
            throw `nothing bound to ${type.toString()}`;
        }

        const {object, factory, value, cache, singleton} = this._registry[type.toString()];

        const cacheItem = (item: T): T => {
            if (singleton && typeof cache !== "undefined") return cache;
            if (singleton) this._registry[type.toString()].cache = item;
            return item
        };

        if (typeof object !== "undefined") return cacheItem(new object());
        if (typeof factory !== "undefined") return cacheItem(factory());
        if (typeof value !== "undefined") return value;

        throw `nothing is bound to ${type.toString()}`;
    }

    snapshot(): Container {
        this._snapshots.push({...this._registry});
        return this;
    }

    restore(): Container {
        this._registry = this._snapshots.pop() || this._registry;
        return this;
    }

    private _add<T>(type: symbol): IConfig<T> {
        if (this._registry[type.toString()]) {
            throw `object can only bound once: ${type.toString()}`;
        }

        this._registry[type.toString()] = {
            singleton: false,
            tags: [],
        };

        return this._registry[type.toString()];
    }
}
