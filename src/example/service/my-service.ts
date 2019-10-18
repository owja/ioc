export interface MyServiceInterface {
    hello: string;
}

export class MyService implements MyServiceInterface {
    hello = "world";
}
