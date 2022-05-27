import {token} from "../../ioc/token";
import {MyOtherService} from "./my-other-service";

export const TYPE = {
    MyService: Symbol("MyService"),
    MyOtherService: token<MyOtherService>("MyOtherService"),
};
