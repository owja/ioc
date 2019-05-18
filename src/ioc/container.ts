interface IConfig<T> {
    singleScope: boolean;
    tags: string[];
    object?: INewAble<T>;
    factory?: Factory<T>;
    value?: Value<T>;
}

interface INewAble<T> {
    new(...args: any[]): T
}

type Factory<T> = () => T;

type Value<T> = T;

class Bind<T> {

    constructor(
        private _target: IConfig<T>
    ) {};

    to(object: INewAble<T>): void {
        this._target.object = object;
    }

    toFactory(factory: Factory<T>): void {
        this._target.factory = factory;
    }

    toValue(value: Value<T>): void {
        this._target.value = value;
    }
}

type Registry =  {[type: string]: IConfig<any>};

export class Container {

    private _registry: Registry = {};
    private _snapshots: Registry[] = [];

    bind<T = never>(type: Symbol): Bind<T> {
        return new Bind<T>(this._add<T>(type));
    }

    rebind<T = never>(type: Symbol): Bind<T> {
        return this.remove(type).bind<T>(type);
    }

    remove(type: Symbol): Container {
        if (!this._registry[type.toString()]) {
            throw `${type.toString()} was never bound`;
        }

        delete this._registry[type.toString()];

        return this;
    }

    get<T = never>(type: Symbol): T {
        if (!this._registry[type.toString()]) {
            throw `nothing bound to ${type.toString()}`;
        }

        const {object, factory, value} = this._registry[type.toString()];

        if (object) return new object();
        if (factory) return factory();
        if (value) return value;

        throw `nothing is bound to ${type.toString()}`;
    }

    snapshot(): Container {
        this._snapshots.push({...this._registry});
        return this;
    }

    restore(): Container {
        this._registry = this._snapshots.pop() || this._registry;
        return this;
    }

    private _add<T>(type: Symbol): IConfig<T> {
        if (this._registry[type.toString()]) {
            console.log(type);
            throw `object can only bound once: ${type.toString()}`;
        }

        this._registry[type.toString()] = {
            singleScope: false,
            tags: [],
        };

        return this._registry[type.toString()];
    }

}
