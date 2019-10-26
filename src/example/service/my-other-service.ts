export interface MyOtherServiceInterface {
    random: number;
}

export class MyOtherService implements MyOtherServiceInterface {
    random = Math.random();
}
