import type {RegItem, Token, MaybeToken, Plugin} from "./types";
import {Bind} from "./bind";
import {getType, stringifyToken} from "./token";
import {NOPLUGINS} from "./tags";
import {valueOrArrayToArray} from "./utils";

type Registry = Map<symbol, RegItem>;

export class Container {
    private _registry: Registry = new Map<symbol, RegItem>();
    private _snapshots: Registry[] = [];
    private _plugins: Plugin[] = [];

    bind<Dep = never, Args extends Array<unknown> = never>(token: MaybeToken<Dep>): Bind<Dep, Args> {
        return new Bind<Dep, Args>(this._createItem<Dep, Args>(token));
    }

    rebind<Dep = never, Args extends Array<unknown> = never>(token: MaybeToken<Dep>): Bind<Dep, Args> {
        return this.remove(token).bind<Dep, Args>(token);
    }

    remove(token: MaybeToken): Container {
        if (this._registry.get(getType(token)) === undefined) throw `${stringifyToken(token)} was never bound`;

        this._registry.delete(getType(token));

        return this;
    }

    get<Dep>(token: Token<Dep> | MaybeToken<Dep>, tags?: symbol[] | symbol, target?: unknown): Dep;
    get<Dep, Args extends Array<unknown>>(
        token: Token<Dep, Args> | MaybeToken<Dep>,
        tags: symbol[] | symbol,
        target: unknown,
        args: Args,
    ): Dep;
    get<Dep, Args extends Array<unknown>>(
        token: Token<Dep, Args> | MaybeToken<Dep>,
        tags: symbol[] | symbol = [],
        target?: unknown,
        args?: Args,
    ): Dep {
        const item = <RegItem<Dep, Args> | undefined>this._registry.get(getType(token));

        if (!item || (!item.factory && item.value === undefined)) throw `nothing bound to ${stringifyToken(token)}`;

        const value: Dep = item.factory
            ? !item.singleton
                ? item.factory(...((args || []) as any))
                : (item.cache = item.cache || item.factory(...((args || []) as any)))
            : item.value!; // eslint-disable-line

        const tagsArr = valueOrArrayToArray(tags);

        if (tagsArr.indexOf(NOPLUGINS) === -1) {
            for (const plugin of item.plugins.concat(this._plugins)) {
                plugin(value, target, tagsArr, token, this);
            }
        }

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
    private _createItem<Dep, Args extends Array<unknown> = []>(
        token: Token<Dep, Args> | MaybeToken<Dep>,
    ): RegItem<Dep, Args> {
        if (this._registry.get(getType(token)) !== undefined)
            throw `object can only bound once: ${stringifyToken(token)}`;

        const item = {plugins: []};
        this._registry.set(getType(token), item);

        return item;
    }
}
