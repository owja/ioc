import type {Item, NewAble, Factory, Value} from "./types";
import {Options} from "./options";
import {PluginOptions} from "./pluginOptions";

export class Bind<T> {
    constructor(private _target: Item<T>) {}

    to(object: NewAble<T>): Options<T> {
        this._target.injected = (...args: any[]) => new object(...args);
        return new Options<T>(this._target);
    }

    toFactory(factory: Factory<T>): Options<T> {
        this._target.injected = factory;
        return new Options<T>(this._target);
    }

    toValue(value: Value<T>): PluginOptions<T> {
        if (typeof value === "undefined") throw "cannot bind a value of type undefined";
        this._target.injected = value;
        return new PluginOptions<T>(this._target);
    }
}
