"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingCancelled = exports.BookingCreated = void 0;
class BookingCreated {
    id;
    flightNumber;
    aircraftId;
    departureAirportId;
    arriveAirportId;
    flightDate;
    price;
    description;
    seatNumber;
    passengerName;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.BookingCreated = BookingCreated;
class BookingCancelled {
    id;
    flightNumber;
    aircraftId;
    departureAirportId;
    arriveAirportId;
    flightDate;
    price;
    description;
    seatNumber;
    passengerName;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.BookingCancelled = BookingCancelled;
//# sourceMappingURL=booking.contract.js.map