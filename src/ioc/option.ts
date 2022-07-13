import { PluginOptions } from "./plugin";

export class Options<T> extends PluginOptions<T> {
  inSingletonScope(): PluginOptions<T> {
      this._target.singleton = true;
      return this;
  }
}
