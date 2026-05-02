# 🔭 Observability Stack (LGTM + OpenTelemetry)

This document explains the Observability stack implemented in the Booking Microservices project. A robust observability system is critical in microservices to understand system behavior, debug issues, and monitor performance across distributed boundaries.

---

## 1. The Core Problem in Microservices
In a monolithic application, tracing an error is simple: you check a single log file. In microservices, a single user request might travel through an API Gateway, the Booking Service, a Message Broker (RabbitMQ), and finally the Flight Service. 
If an error occurs, answering *"Where did it fail and why?"* is incredibly difficult without centralized observability.

To solve this, the project implements the **LGTM Stack** (Loki, Grafana, Tempo, Metrics) combined with **OpenTelemetry**.

---

## 2. Components of the Observability Stack

### 📡 1. OpenTelemetry Collector (`otel-collector`)
**Role: The Central Telemetry Router**
Instead of having each microservice directly send data to Prometheus, Loki, and Tempo (which requires maintaining multiple SDKs and configurations per service), the system uses the vendor-agnostic OpenTelemetry (OTel) standard.
- Every microservice pushes its Traces, Metrics, and Logs to the `otel-collector` in a single format (OTLP).
- The Collector processes, filters, and exports the data to the appropriate backend storage systems.

### 📊 2. Prometheus (`prometheus`)
**Role: Metrics Storage (Time-series Database)**
Prometheus scrapes and stores numeric metrics over time.
- **Usage:** Tracking CPU/Memory usage, HTTP request counts, active RabbitMQ connections, error rates (e.g., 500 Internal Server Errors per second).
- **Why it matters:** It alerts you if the system is under heavy load or if an anomaly occurs.

### 🔗 3. Grafana Tempo (`tempo`)
**Role: Distributed Tracing**
Tempo records the journey of a single request as it hops between different microservices.
- **Usage:** Every incoming request is assigned a unique `TraceID`. Tempo visualizes this as a waterfall chart. 
- **Why it matters:** If creating a booking takes 5 seconds, Tempo shows you exactly where the bottleneck is (e.g., 4.5 seconds were spent waiting for a database query in the Flight Service).

### 📝 4. Grafana Loki (`loki`)
**Role: Centralized Logging**
Loki aggregates logs from all containers into a single searchable database.
- **Usage:** Instead of SSH-ing into individual containers and running `docker logs`, all `console.log()` and error stack traces are streamed to Loki. 
- **Why it matters:** Highly efficient log storage and querying based on labels rather than full-text indexing, saving significant infrastructure resources.

### 👁️ 5. Grafana (`grafana`)
**Role: The Unified Visualization Dashboard**
Grafana acts as the "frontend" for Prometheus, Tempo, and Loki.
- **Usage:** It provides beautiful, real-time dashboards to monitor system health.
- **The Magic Link:** Grafana seamlessly connects Logs, Metrics, and Traces. If you see a CPU spike on a Prometheus graph, you can click it to see the Loki logs for that exact minute. From a log entry, you can click the `TraceID` to instantly view the distributed trace in Tempo.

---

## 3. Summary
This setup is **production-grade**. By unifying OpenTelemetry with the LGTM stack, the project ensures that whenever a bug or performance degradation occurs in production, engineers have the exact metrics to detect it, the traces to locate it, and the logs to fix it.
