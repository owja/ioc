import type {RegItem, Plugin} from "./types";

export class PluginOptions<Dep, Args extends Array<unknown>> {
    constructor(protected _regItem: RegItem<Dep, Args>) {}

    withPlugin(plugin: Plugin<Dep>): PluginOptions<Dep, Args> {
        this._regItem.plugins.push(plugin);
        return this;
    }
}
