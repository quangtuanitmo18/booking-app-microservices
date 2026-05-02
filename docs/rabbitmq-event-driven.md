# 🐇 RabbitMQ & Event-Driven Architecture

This document explains the Event-Driven Architecture using RabbitMQ, and how it is applied to link Microservices together in the project.

---

## 1. What is RabbitMQ / Message Broker?
**RabbitMQ** is a Message Broker. Instead of Service A calling Service B directly (via HTTP/REST), Service A will "send a message" to RabbitMQ. RabbitMQ is then responsible for safely distributing that message to Service B, C, D, etc.

## 2. Why use RabbitMQ in Microservices?
- **Decoupling:** Service A does not need to know whether Service B exists or if it is currently down. Service A simply finishes its job and "shouts out" (Publishes an Event).
- **Asynchronous Execution:** Users don't have to wait for background tasks to complete. (For example: Once a Booking is created, return the result to the user immediately; sending the confirmation email or updating reward points will run in the background via the message queue).
- **Resiliency:** If Service B crashes, the message is safely stored in RabbitMQ. Once Service B is back online, it will consume the old messages and process them without data loss.

---

## 3. How it works in the Project

In the `booking-microservices-nestjs` project, the RabbitMQ module is encapsulated within the shared library `building-blocks/rabbitmq`.

The architecture applied here is **Publish/Subscribe (Pub/Sub)** via Integration Events.

### Real-world Flow: When a Booking is successfully created

#### Step 1: Define the Contract
Events traveling across the network need a clear structure (Schema) so both the sender and receivers can understand them. This structure is located in `building-blocks/contracts`.

```typescript
// building-blocks/contracts/booking.contract.ts
export class BookingCreated {
  bookingId: number;
  flightId: number;
  passengerName: string;
  
  constructor(data: any) {
    // map data
  }
}
```

#### Step 2: Publisher sends the signal
In the **Booking Service**, after successfully saving data to the Database, the system Publishes an event. It announces to the entire system: *"Hey, I just successfully created a new Booking!"*.

```typescript
// src/booking/src/booking/features/v1/create-booking/create-booking.ts
@CommandHandler(CreateBooking)
export class CreateBookingHandler {
  constructor(@Inject('IRabbitmqPublisher') private rabbitmqPublisher: IRabbitmqPublisher) {}

  async execute(command: CreateBooking): Promise<BookingDto> {
    // ... Database saving logic (Booking)
    
    // Publish Event to RabbitMQ
    await this.rabbitmqPublisher.publishMessage(new BookingCreated(bookingEntity));

    return result;
  }
}
```

#### Step 3: Subscriber (Consumer) listens for the signal
At this point, over in the **Flight Service** or **Identity/Notification Service**, we declare Event Handlers to "listen" for this event.

For example, when the Notification Service hears `BookingCreated`, it automatically retrieves the passenger's email and sends a notification.
```typescript
// Example logic on the Consumer side (Notification Service or Flight Service)
@EventPattern('BookingCreated') // Listening to the 'BookingCreated' topic from RabbitMQ
export class BookingCreatedHandler {
  async handle(event: BookingCreated) {
    console.log(`Received event with booking ID: ${event.bookingId}`);
    
    // Execute logic: Send email, deduct seat count on flight, add membership points...
  }
}
```

## 4. Mindset Summary
The combination of **CQRS** and **RabbitMQ** forms a classic pattern in Microservices:
1. User calls the API -> A **Command** is triggered.
2. The Command persists changes to the local DB.
3. The Command generates an **Integration Event** and pushes it to **RabbitMQ**.
4. Other Microservices (Consumers) catch this Event and update their own local DBs (Maintaining Eventual Consistency).
