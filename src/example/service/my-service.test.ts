import {MyService} from "./my-service";

describe("Example MyService", () => {
    test('should return "world"', () => {
        expect(new MyService().hello).toBe("world");
    });
});
