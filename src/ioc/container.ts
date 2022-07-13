import {getType, stringifyToken} from "./token";
import {NOPLUGINS} from "./symbol";
import type { Factory, Item, MaybeToken, NewAble, Plugin, Registry, Value } from "./types";


class PluginOptions<T> {
    constructor(protected _target: Item<T>) {}

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
    constructor(private _target: Item<T>) {}

    to(object: NewAble<T>): Options<T> {
        this._target.factory = () => new object();
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
    private _registry: Registry = new Map<symbol, Item<any>>();
    private _snapshots: Registry[] = [];
    private _plugins: Plugin[] = [];

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

    get<T = never>(token: MaybeToken<T>, args: symbol[] = [], target?: unknown): T {
        const item = this._registry.get(getType(token));

        if (item === undefined) {
            throw `nothing bound to ${stringifyToken(token)}`;
        }

        const {factory, value, cache, singleton, plugins} = item;

        const execPlugins = (item: T): T => {
            if (args.indexOf(NOPLUGINS) !== -1) return item;

            for (const plugin of this._plugins.concat(plugins)) {
                plugin(item, target, args, token, this);
            }

            return item;
        };

        const cacheItem = (creator: () => T): T => {
            if (singleton && typeof cache !== "undefined") return cache;
            if (!singleton) return creator();
            item.cache = creator();
            return item.cache;
        };

        if (typeof value !== "undefined") return execPlugins(value);
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

    private _create<T>(token: MaybeToken<T>): Item<T> {
        if (this._registry.get(getType(token)) !== undefined) {
            throw `object can only bound once: ${stringifyToken(token)}`;
        }

        const item = {plugins: []};
        this._registry.set(getType(token), item);

        return item;
    }
}
