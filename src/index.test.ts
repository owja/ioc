import {Container, inject} from "./";
import {Container as ContainerOriginal} from "./ioc/container";
import {inject as injectOriginal} from "./ioc/inject";

describe("Module", () => {

    test("should export \"Container\" class", () => {
        expect(Container).toEqual(ContainerOriginal);
    });

    test("should export \"inject\" function", () => {
        expect(inject).toEqual(injectOriginal);
    });

});
