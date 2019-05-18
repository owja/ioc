import {Container, inject} from "..";

const container = new Container();

interface IWheel {
    readonly radius: number;
    readonly depth: number;
    pressure: number;
}

interface IWheel {
    readonly radius: number;
    readonly depth: number;
    pressure: number;
}

interface ICar {
    wheels: [IWheel, IWheel, IWheel, IWheel];
    length: number;
    width: number;
    spoiler: boolean;
}

type WheelSet = [IWheel, IWheel, IWheel, IWheel];

const TYPES = {
    OffRoadWheels: Symbol.for("OffRoadWheels"),
    RacingWheels: Symbol.for("RacingWheels"),
    OffRoadCar: Symbol.for("OffRoadCar"),
    RacingCar: Symbol.for("RacingCar"),
};

class OffRoadWheel implements IWheel {
    radius = 10;
    depth = 4;
    pressure = 2;

    @inject(TYPES.OffRoadCar, container)
    car!: ICar;
}

class RacingWheel implements IWheel {
    radius = 10;
    depth = 3;
    pressure = 3.5;
}

class RacingCar implements ICar {
    length = 300;
    spoiler = true;
    width = 70;

    @inject(TYPES.RacingWheels, container)
    wheels!: WheelSet;
}

class OffRoadCar implements ICar {
    length = 270;
    spoiler = false;
    width = 90;

    @inject(TYPES.OffRoadWheels, container)
    wheels!: WheelSet;
}

container.bind<WheelSet>(TYPES.RacingWheels).toFactory(() => [new RacingWheel(), new RacingWheel(), new RacingWheel(), new RacingWheel()]);
container.bind<WheelSet>(TYPES.OffRoadWheels).toFactory(() => [new OffRoadWheel(), new OffRoadWheel(), new OffRoadWheel(), new OffRoadWheel()]);
container.bind<ICar>(TYPES.RacingCar).to(RacingCar);
container.bind<ICar>(TYPES.OffRoadCar).to(OffRoadCar);

class Garage {
    @inject(TYPES.OffRoadCar, container)
    offRoad!: ICar;

    @inject(TYPES.RacingCar, container)
    racing!: ICar;
}

console.log("Building the garage");

let garage: Garage;
garage = new Garage();

console.log(garage.offRoad, garage.offRoad.wheels);
console.log(garage.racing, garage.racing.wheels);

console.log("Snapshot and rebind");

container.snapshot();
container.rebind<ICar>(TYPES.OffRoadCar).to(RacingCar);

console.log("Building new garage");

garage = new Garage();
console.log(garage.offRoad);

console.log("Restore");
container.restore();

garage = new Garage();
console.log(garage.offRoad);
