import {Container, createDecorator} from "../../";

import {TYPE} from "./types";

import {MyServiceInterface, MyService} from "./my-service";
import {MyOtherServiceInterface, MyOtherService} from "./my-other-service";

const container = new Container();
const inject = createDecorator(container);

container.bind<MyServiceInterface>(TYPE.MyService).to(MyService);
container.bind<MyOtherServiceInterface>(TYPE.MyOtherService).to(MyOtherService);

export {container, TYPE, inject};
