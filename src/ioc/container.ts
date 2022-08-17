import type {Factory, Injected, Item, MaybeToken, Plugin} from "./types";
import {Bind} from "./bind";
import {getType, stringifyToken} from "./token";
import {NOPLUGINS} from "./tags";

const isFactory = <T>(i: Injected<T>): i is Factory<T> => typeof i === "function";

export class Container {
    private _registry = new Map<symbol, Item<unknown>>();
    private _snapshots: typeof this._registry[] = [];
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

    get<T = never>(token: MaybeToken<T>, tags: symbol[] = [], target?: unknown, ctorArgs: any[] = []): T {
        const item = <Item<T> | undefined>this._registry.get(getType(token));

        if (item === undefined || item.injected === undefined) throw `nothing bound to ${stringifyToken(token)}`;

        const value = isFactory(item.injected)
            ? !item.singleton
                ? item.injected(...ctorArgs)
                : (item.cache = item.cache || item.injected())
            : item.injected;

        if (tags.indexOf(NOPLUGINS) === -1)
            item.plugins.concat(this._plugins).forEach((plugin) => {
                plugin(value, target, tags, token, this);
            });

        return value;
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
        if (this._registry.get(getType(token)) !== undefined)
            throw `object can only bound once: ${stringifyToken(token)}`;

        const item = {plugins: []};
        this._registry.set(getType(token), item);

        return item;
    }
}
