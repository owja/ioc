import type {MyOtherServiceInterface} from "./service/my-other-service";
import type {MyServiceInterface} from "./service/my-service";
import {container, TYPE} from "./service/container";

import {MyServiceMock} from "./test/my-service-mock";
import {MyOtherServiceMock} from "./test/my-other-service-mock";

import {Example} from "./example";

describe("Example", () => {
    let example: Example;
    beforeEach(() => {
        container.snapshot();
        container.rebind<MyServiceInterface>(TYPE.MyService).to(MyServiceMock);
        container.rebind<MyOtherServiceInterface>(TYPE.MyOtherService).to(MyOtherServiceMock);

        example = new Example();
    });

    afterEach(() => {
        container.restore();
    });

    test('should return "test"', () => {
        expect(example.myService.hello).toBe("test");
    });

    test('should return "1" on cached service', () => {
        expect(example.myOtherService.random).toBe(1);
        expect(example.myOtherService.random).toBe(1); // twice because this is cached
    });

    test("should increase number on service with disabled cache", () => {
        const number1 = example.myUncachedOtherService.random;
        const number2 = example.myUncachedOtherService.random;

        expect(number2).toBe(number1 + 1);
    });
});
