import {getType, MaybeToken, stringifyToken} from "./token";
import {NOPLUGINS} from "./symbol";

interface IConfig<T> {
    object?: INewAble<T>;
    factory?: Factory<T>;
    value?: Value<T>;
    cache?: T;
    singleton: boolean;
    plugins: Plugin<T>[];
}

export type Plugin<T = unknown> = (
    item: T,
    target: unknown,
    token: MaybeToken<T>,
    container: Container,
    args: MaybeToken[],
) => void;
interface INewAble<T> {
    new (...args: any[]): T;
}

type Registry = Map<symbol, IConfig<any>>;

type Factory<T> = () => T;
type Value<T> = T;

class PluginOptions<T> {
    constructor(protected _target: IConfig<T>) {}

    withPlugin(plugin: Plugin<T>): PluginOptions<T> {
        this._target.plugins.push(plugin);
        return this;
    }
}

class Options<T> extends PluginOptions<T> {
    inSingletonScope(): PluginOptions<T> {
        this._target.singleton = true;
        return this;
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

    toValue(value: Value<T>): PluginOptions<T> {
        if (typeof value === "undefined") {
            throw "cannot bind a value of type undefined";
        }
        this._target.value = value;
        return new PluginOptions<T>(this._target);
    }
}

export class Container {
    private _registry: Registry = new Map<symbol, IConfig<any>>();
    private _snapshots: Registry[] = [];
    private _plugins: Plugin[] = [];

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

    get<T = never>(token: MaybeToken<T>, argTokens: MaybeToken[] = [], target?: unknown): T {
        const regItem = this._registry.get(getType(token));

        if (regItem === undefined) {
            throw `nothing bound to ${stringifyToken(token)}`;
        }

        const {object, factory, value, cache, singleton, plugins} = regItem;

        const execPlugins = (item: T): T => {
            if (argTokens.indexOf(NOPLUGINS) !== -1) return item;

            for (const plugin of this._plugins.concat(plugins)) {
                plugin(item, target, token, this, argTokens);
            }

            return item;
        };

        const cacheItem = (creator: () => T): T => {
            if (singleton && typeof cache !== "undefined") return cache;
            if (!singleton) return creator();
            regItem.cache = creator();
            return regItem.cache;
        };

        if (typeof value !== "undefined") return execPlugins(value);
        if (typeof object !== "undefined") return execPlugins(cacheItem(() => new object()));
        if (typeof factory !== "undefined") return execPlugins(cacheItem(() => factory()));

        throw `nothing is bound to ${stringifyToken(token)}`;
    }

    addPlugin(plugin: Plugin): Container {
        this._plugins.push(plugin);
        return this;
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

        const conf = {singleton: false, plugins: []};
        this._registry.set(getType(token), conf);

        return conf;
    }
}
