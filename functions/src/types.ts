export enum TripType {
    instantPassenger,
    instantCargo,
    scheduledPassenger,
    scheduledCargo,
}

export enum TripStatus {
    Open,
    AwaitingDriver,
    DriverAccepted,
    DriverPath,
    Started,
    Finished,
    Canceled,
    DriverCanceled,
}

export enum DBCollection {
    payments = 'Payments',
    paymentReviews = 'TripReviews',
    drivers = 'Drivers',
    trips = "Trips",
    passengers = 'Passengers',
    stations = 'Stations',
    vehicleTypes = 'VehicleTypes',
    truckBody = 'TruckBody',
    paymentNotifications = 'PaymentNotifications',
    tripNotifications = 'TripNotifications',
    notifications = 'Notifications',
}

export enum UserType{
    Driver,
    Passenger
}