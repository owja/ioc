import type {MyOtherService} from "./my-other-service";
import {token} from "../../ioc/token";

export const TYPE = {
    MyService: Symbol("MyService"),
    MyOtherService: token<MyOtherService>("MyOtherService"),
};
