# 🎭 Event-Driven Architecture (EDA) & Choreography

This document outlines the core concepts of Event-Driven Architecture (EDA) and how the **Choreography** pattern is actively used within the Booking Microservices project.

---

## 1. What is Event-Driven Architecture?

**Event-Driven Architecture (EDA)** is a software design pattern where decoupled applications or microservices asynchronously publish and subscribe to **Events**. 

An **Event** is a record of a significant change in state (a "Fact"). It is always named in the past tense because it represents something that has already happened and cannot be changed (e.g., `UserCreated`, `BookingCreated`, `FlightReserved`).

Instead of services calling each other directly via synchronous HTTP requests (REST/gRPC), they communicate by emitting events into a Message Broker (like RabbitMQ) and listening for events they care about.

---

## 2. Orchestration vs. Choreography

When coordinating a business process that spans multiple microservices, there are two primary patterns:

### 🎻 Orchestration (The Conductor)
- **Concept:** There is a central "Orchestrator" service that tells other services what to do.
- **Example:** A central `OrderService` tells the `PaymentService` to charge the card, then tells the `InventoryService` to reserve items.
- **Pros:** Easy to track the entire workflow in one place.
- **Cons:** Creates a central point of failure and tight coupling (the orchestrator must know about all other services).

### 💃 Choreography (The Dancers)
- **Concept:** There is no central orchestrator. Each service knows its own job. When an event happens, services react to it independently.
- **Example:** The system plays a song (Event), and the dancers (Services) automatically know what steps to perform.
- **Pros:** Extremely loose coupling. You can add or remove services without changing existing code.
- **Cons:** Harder to track the overall flow of a complex business process.

> 🚀 **The Booking Microservices project uses the Choreography pattern.**

---

## 3. Choreography in Action: A Real Project Example

Let's look at a concrete example from the project: **When a new user registers.**

In a tightly coupled REST architecture, the `Identity Service` would have to make a direct API call to the `Passenger Service` to tell it to create a passenger profile. If `Passenger Service` is down, the registration fails.

In this project, we use **Choreography**:

### Step 1: The Publisher (Identity Service)
The Identity Service creates the user in its database. Once done, it simply shouts out an event (`UserCreated`) to RabbitMQ and completes its job. It doesn't know or care if the Passenger Service even exists.

```typescript
// Identity Service (Publisher)
await this.rabbitmqPublisher.publishMessage(
  new UserCreated({ id, email, name })
);
```

### Step 2: The Consumer (Passenger Service)
The Passenger Service is configured to "listen" for the `UserCreated` event. As soon as the application bootstraps, it subscribes to the RabbitMQ queue.

```typescript
// src/passenger/src/passenger/passenger.module.ts
export class PassengerModule implements OnApplicationBootstrap {
    constructor(
        @Inject('IRabbitmqConsumer') private readonly rabbitmqConsumer: IRabbitmqConsumer,
        @Inject('IPassengerRepository') private readonly passengerRepository: IPassengerRepository
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        // Listening for the UserCreated event
        await this.rabbitmqConsumer.consumeMessage<UserCreated>(
            new UserCreated(), 
            // The handler that automatically reacts and creates the Passenger record
            new CreateUserHandler(this.passengerRepository).createUserConsumerHandler
        );
    }
}
```

### Why is this powerful?
1. **Zero Coupling:** If we later add a `LoyaltyService` to give new users 100 bonus points, we just write a new consumer in the `LoyaltyService` to listen to `UserCreated`. **We do not need to change a single line of code in the `IdentityService`.**
2. **Resilience:** If the `Passenger Service` crashes, the `UserCreated` event safely sits in RabbitMQ. When the service restarts, it picks up the event and creates the passenger profile. No data is lost.
3. **Eventual Consistency:** While the Passenger database isn't updated in the exact same millisecond as the Identity database, it will be updated "eventually" (usually within a few milliseconds), maintaining system-wide data integrity without locking databases.
