import {MyOtherService} from "./my-other-service";

describe("Example MyOtherService", () => {
    test("should return number between 0 and 1", () => {
        expect(new MyOtherService().random).toBeGreaterThanOrEqual(0);
        expect(new MyOtherService().random).toBeLessThanOrEqual(1);
    });

    test("should not be the same all time (but could be)", () => {
        const numbers = [
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
            new MyOtherService().random,
        ];

        const checkNumber = new MyOtherService().random;
        let hasDifferences = false;
        for (const num of numbers) {
            if (checkNumber !== num) {
                hasDifferences = true;
                break;
            }
        }

        expect(hasDifferences).toBe(true);
    });
});
