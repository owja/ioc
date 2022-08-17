import type {MyServiceInterface} from "../service/my-service";

export class MyServiceMock implements MyServiceInterface {
    hello = "test";
}
