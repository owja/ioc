import type {Item, Plugin} from "./types";

export class PluginOptions<T> {
    constructor(protected _target: Item<T>) {}

    withPlugin(plugin: Plugin<T>): PluginOptions<T> {
        this._target.plugins.push(plugin);
        return this;
    }
}
