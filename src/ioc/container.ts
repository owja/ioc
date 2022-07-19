import {getType, stringifyToken} from "./token";
import type { Factory, Item, MaybeToken, Plugin, Registry } from "./types";
import { Bind } from "./bind";
import {NOPLUGINS} from "./tags";

export class Container {
    private _registry: Registry = new Map<symbol, Item<unknown>>();
    private _snapshots: Registry[] = [];
    private _plugins: Plugin[] = [];

    bind<T = never>(token: MaybeToken<T>): Bind<T> {
        return new Bind<T>(this._createItem<T>(token));
    }

    rebind<T = never>(token: MaybeToken<T>): Bind<T> {
        return this.remove(token).bind<T>(token);
    }

    remove(token: MaybeToken): Container {
        if (this._registry.get(getType(token)) === undefined) throw `${stringifyToken(token)} was never bound`;

        this._registry.delete(getType(token));

        return this;
    }

    get<T = never>(token: MaybeToken<T>, tags: symbol[] = [], target?: unknown): T {
        const item = <Item<T> | undefined>this._registry.get(getType(token));

        if (item === undefined || item.injected === undefined) throw `nothing bound to ${stringifyToken(token)}`;

        const value = typeof item.injected !== "function" 
            ? item.injected 
            : this._cacheItem(item);

        return this._execPluginsItem(item.plugins, value, token, tags, target);
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

    /* Item related */
    private _createItem<T>(token: MaybeToken<T>): Item<T> {
        if (this._registry.get(getType(token)) !== undefined) throw `object can only bound once: ${stringifyToken(token)}`;

        const item = {plugins: []};
        this._registry.set(getType(token), item);

        return item;
    }

    private _execPluginsItem<T>(itemPlugins: Plugin<T, unknown>[], value: T, token: MaybeToken<T>, tags: symbol[], target?: unknown): T {
        if (tags.indexOf(NOPLUGINS) === -1)
            itemPlugins.concat(this._plugins).forEach(plugin => {
                plugin(value, target, tags, token, this);
            });
        return value;
    }

    private _cacheItem<T>(item: Item<T>): T {
        if (!item.singleton) return (<Factory<T>>item.injected)();
        if (item.cache === undefined) item.cache = (<Factory<T>>item.injected)();
        return item.cache;
    }
}
