import {PluginOptions} from "./pluginOptions";

export class Options<Dep, Args extends Array<unknown>> extends PluginOptions<Dep, Args> {
    inSingletonScope(): PluginOptions<Dep, Args> {
        this._regItem.singleton = true;
        return this;
    }
}
