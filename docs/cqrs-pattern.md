# 🏗️ CQRS Pattern in Booking Microservices

This document explains the CQRS (Command Query Responsibility Segregation) architecture and how it is practically applied in the Booking Microservices project using NestJS.

---

## 1. What is CQRS?
**CQRS** (Command Query Responsibility Segregation) is a design pattern that strictly separates operations that mutate data state (Commands) from operations that only read data (Queries).

Instead of using a single monolithic Service class containing a mix of `createBooking()`, `updateBooking()`, and `getBookingById()`, we separate them into two distinct flows:
- **Command (Write/Update/Delete):** Mutates the state of the system. Examples: `CreateBooking`, `CancelFlight`. Commands should not return data (except for the ID of the newly created object or a success status).
- **Query (Read):** Retrieves data only and strictly does not alter state. Examples: `GetBookingById`, `GetAvailableFlights`.

## 2. Why apply CQRS to this project?
- **Single Responsibility Principle:** Controller code is very thin (only receives requests and pushes them to the Bus). Complex business logic is fully encapsulated within the Handlers.
- **Feature-based Organization:** Easy to navigate. If you want to modify the booking creation logic, you only need to go to the `features/create-booking` directory, where everything (Command, DTO, Handler, Validations) is located.
- **Independent Scalability:** In real-world systems, Read operations (Queries) often outnumber Write operations (Commands) by 10-100 times. CQRS paves the way for segregating Read and Write databases to scale the system independently in the future.

---

## 3. How it works in the Project (with `@nestjs/cqrs`)

The project uses the official `@nestjs/cqrs` library from NestJS. The standard flow operates as follows:

**HTTP Request ➡️ Controller ➡️ CommandBus ➡️ CommandHandler ➡️ Repository/DB**

### Step 1: Define the Command
A Command is a simple class that contains the data necessary to execute an action.
```typescript
// create-booking.ts
export class CreateBooking {
  passengerId: number;
  flightId: number;
  description: string;

  constructor(request: Partial<CreateBooking> = {}) {
    Object.assign(this, request);
  }
}
```

### Step 2: Controller dispatches the Command to CommandBus
The Controller contains no logic. It receives the Request (usually via REST API) and delegates (dispatches) it to the `CommandBus`.
```typescript
// create-booking.ts (Controller)
@Post('create')
public async createBooking(
  @Body() request: CreateBookingRequestDto,
  @Res() res: Response
): Promise<BookingDto> {
  // Dispatch the Command to the Bus. The Bus will automatically find the correct Handler to execute.
  const result = await this.commandBus.execute(new CreateBooking(request));
  
  res.status(HttpStatus.CREATED).send(result);
  return result;
}
```

### Step 3: Command Handler executes business logic
This is the "heart" of the feature. Each Command must have exactly one corresponding Handler (mapped via the `@CommandHandler` decorator).
```typescript
// create-booking.ts (Handler)
@CommandHandler(CreateBooking)
export class CreateBookingHandler implements ICommandHandler<CreateBooking> {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly flightClient: IFlightClient,
    private readonly rabbitmqPublisher: IRabbitmqPublisher
  ) {}

  async execute(command: CreateBooking): Promise<BookingDto> {
    // 1. Validate data
    await createBookingValidations.validateAsync(command);

    // 2. Call HTTP clients (Flight, Passenger) to check seat availability
    const flight = await this.flightClient.getFlightById(command.flightId);
    
    // 3. Write to Database via Repository
    const bookingEntity = await this.bookingRepository.createBooking(...);

    // 4. Publish Event (CQRS often goes hand-in-hand with Event-Driven architectures)
    await this.rabbitmqPublisher.publishMessage(new BookingCreated(bookingEntity));

    return result;
  }
}
```

## 4. Summary
Applying CQRS following the `features/v1/...` directory structure keeps the project extremely "clean". When adding new features, you don't have to modify old Service classes (avoiding code conflicts). You simply create a new folder and define a new pair of `Command` and `CommandHandler`. This architecture is highly favored in large enterprises with large teams.
