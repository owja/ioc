import type {RegItem, NewAble, Factory, Value} from "./types";
import {Options} from "./options";
import {PluginOptions} from "./pluginOptions";

export class Bind<Dep, Args extends Array<unknown>> {
    constructor(private _regItem: RegItem<Dep, Args>) {}

    to<Obj extends NewAble<Dep, Args>>(object: Obj): Options<Dep, Args> {
        this._regItem.factory = (...args: Args): Dep => new object(...args);
        return new Options<Dep, Args>(this._regItem);
    }

    toFactory(factory: Factory<Dep, Args>): Options<Dep, Args> {
        this._regItem.factory = factory;
        return new Options<Dep, Args>(this._regItem);
    }

    toValue(value: Value<Dep>): PluginOptions<Dep, never> {
        if (typeof value === "undefined") throw "cannot bind a value of type undefined";
        this._regItem.value = value;
        return new PluginOptions<Dep, never>(this._regItem);
    }
}
