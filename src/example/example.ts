import {TYPE, inject} from "./service/container";
import {MyServiceInterface} from "./service/my-service";
import {MyOtherServiceInterface} from "./service/my-other-service";
import {NOCACHE} from "../";

export class Example {
    @inject(TYPE.MyService)
    readonly myService!: MyServiceInterface;

    @inject(TYPE.MyOtherService)
    readonly myOtherService!: MyOtherServiceInterface;

    @inject(TYPE.MyOtherService, [NOCACHE])
    readonly myUncachedOtherService!: MyOtherServiceInterface;
}
