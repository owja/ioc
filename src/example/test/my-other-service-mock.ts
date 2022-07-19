import type {MyOtherServiceInterface} from "../service/my-other-service";

let number = 0;

export class MyOtherServiceMock implements MyOtherServiceInterface {
    random = ++number;
}
