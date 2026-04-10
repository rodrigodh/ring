# SRE Standards

> **⚠️ MAINTENANCE:** This file is indexed in `dev-team/skills/shared-patterns/standards-coverage-table.md`.
> When adding/removing `## ` sections, follow FOUR-FILE UPDATE RULE in CLAUDE.md: (1) edit standards file, (2) update TOC, (3) update standards-coverage-table.md, (4) update agent file.

This file defines the specific standards for Site Reliability Engineering and observability.

> **Reference**: Always consult `docs/PROJECT_RULES.md` for common project standards.

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| 1 | [Observability](#observability) | Logs, traces, APM tools |
| 2 | [Logging](#logging) | Structured JSON format, log levels |
| 3 | [Tracing](#tracing) | OpenTelemetry configuration |
| 4 | [Structured Logging with lib-common-js](#structured-logging-with-lib-common-js-mandatory-for-typescript) | TypeScript service integration |
| 5 | [Health Checks](#health-checks) | Liveness and readiness probes |

**Meta-sections (not checked by agents):**
- [Checklist](#checklist) - Self-verification before deploying

---

## Observability

| Component | Primary | Alternatives |
|-----------|---------|--------------|
| Logs | Loki | ELK Stack, Splunk, CloudWatch Logs |
| Traces | Jaeger/Tempo | Zipkin, X-Ray, Honeycomb |
| APM | OpenTelemetry | DataDog APM, New Relic APM |

---

## Logging

### Structured Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "logger": "api.handler",
  "message": "Failed to process request",
  "service": "api",
  "version": "1.2.3",
  "environment": "production",
  "trace_id": "abc123def456",
  "span_id": "789xyz",
  "request_id": "req-001",
  "user_id": "usr_456",
  "error": {
    "type": "ConnectionError",
    "message": "connection timeout after 30s",
    "stack": "..."
  },
  "context": {
    "method": "POST",
    "path": "/api/v1/users",
    "status": 500,
    "duration_ms": 30045
  }
}
```

### Log Levels

| Level | Usage | Examples |
|-------|-------|----------|
| **ERROR** | Failures requiring attention | Database connection failed, API error |
| **WARN** | Potential issues | Retry attempt, connection pool low |
| **INFO** | Normal operations | Request completed, user logged in |
| **DEBUG** | Detailed debugging | Query parameters, internal state |
| **TRACE** | Very detailed (rarely used) | Full request/response bodies |

### What to Log

```yaml
# DO log
- Request start/end with duration
- Error details with stack traces
- Authentication events (login, logout, failed attempts)
- Authorization failures
- External service calls (start, end, duration)
- Business events (order placed, payment processed)
- Configuration changes
- Deployment events

# DO not log
- Passwords or API keys
- Credit card numbers (full)
- Personal identifiable information (PII)
- Session tokens
- Internal security mechanisms
- Health check requests (too noisy)
```

### Log Aggregation (Loki)

```yaml
# loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    marsai:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

---

## Tracing

### OpenTelemetry Configuration

```typescript
// TypeScript - OpenTelemetry setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const exporter = new OTLPTraceExporter({
    url: 'http://otel-collector:4317',
});

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'api',
        [ATTR_SERVICE_VERSION]: '1.0.0',
        [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: 'production',
    }),
    traceExporter: exporter,
    sampler: new TraceIdRatioBasedSampler(0.1), // Sample 10%
});

sdk.start();

// Usage
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('api');
const span = tracer.startSpan('processOrder');
span.setAttribute('order.id', orderId);
span.setAttribute('order.items', items.length);
// ... do work ...
span.end();
```

### Span Naming Conventions

```
# Format: <operation>.<entity>

# HTTP handlers
GET /api/users         -> http.request
POST /api/orders       -> http.request

# Database
SELECT users           -> db.query
INSERT orders          -> db.query

# External calls
Payment API call       -> http.client.payment
Email service call     -> http.client.email

# Internal operations
Process order          -> order.process
Validate input         -> input.validate
```

### Trace Context Propagation

```typescript
// Propagate trace context in HTTP headers
import { propagation, context } from '@opentelemetry/api';

// Client - inject context into outgoing request headers
const headers: Record<string, string> = {};
propagation.inject(context.active(), headers);
const response = await fetch(url, { headers });

// Server - extract context from incoming request headers
const extractedContext = propagation.extract(context.active(), req.headers);
// Use extractedContext for downstream operations
```

---

---

## Structured Logging with lib-common-js (MANDATORY for TypeScript)

All TypeScript services **MUST** integrate structured logging using `@V4-Company/lib-common-js`. This ensures consistent observability patterns across all V4-Company services.

> **Note**: lib-common-js currently provides logging infrastructure. Telemetry will be added in future versions.

### Required Dependencies

```json
{
  "dependencies": {
    "@V4-Company/lib-common-js": "^1.0.0"
  }
}
```

### Required Imports

```typescript
import { initializeLogger, Logger } from '@V4-Company/lib-common-js/logger';
import { loadConfigFromEnv } from '@V4-Company/lib-common-js/config';
import { createLoggingMiddleware } from '@V4-Company/lib-common-js/http';
```

### Logging Flow (MANDATORY)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BOOTSTRAP (config.ts)                                        │
│    const logger = initializeLogger()                            │
│    → Creates structured logger once at startup                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ROUTER (routes.ts)                                           │
│    const logMid = createLoggingMiddleware(logger)               │
│    app.use(logMid)            ← Injects logger into request     │
│    ...routes...                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. any layer (handlers, services, repositories)                 │
│    const logger = req.logger || parentLogger                    │
│    logger.info('Processing...', { entityId, requestId })        │
│    → Structured JSON logs with correlation IDs                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Bootstrap Initialization (MANDATORY)

```typescript
// bootstrap/config.ts
import { initializeLogger } from '@V4-Company/lib-common-js/logger';
import { loadConfigFromEnv } from '@V4-Company/lib-common-js/config';

export async function initServers(): Promise<Service> {
    // Load configuration from environment
    const config = loadConfigFromEnv<Config>();

    // Initialize logger
    const logger = initializeLogger({
        level: config.logLevel,
        serviceName: config.serviceName,
        serviceVersion: config.serviceVersion,
    });

    logger.info('Service starting', {
        service: config.serviceName,
        version: config.serviceVersion,
        environment: config.envName,
    });

    // Pass logger to router...
}
```

### 2. Router Middleware Setup (MANDATORY)

```typescript
// adapters/http/routes.ts
import { createLoggingMiddleware } from '@V4-Company/lib-common-js/http';
import express from 'express';

export function createRouter(
    logger: Logger,
    handlers: Handlers
): express.Application {
    const app = express();

    // Create logging middleware - injects logger into request
    const logMid = createLoggingMiddleware(logger);
    app.use(logMid);
    app.use(express.json());

    // ... define routes ...

    return app;
}
```

### 3. Using Logger in Handlers/Services (MANDATORY)

```typescript
// handlers/user-handler.ts
async function createUser(req: Request, res: Response): Promise<void> {
    const logger = req.logger;
    const requestId = req.headers['x-request-id'] as string;

    logger.info('Creating user', {
        requestId,
        email: req.body.email,
    });

    try {
        const user = await userService.create(req.body, logger);
        logger.info('User created successfully', {
            requestId,
            userId: user.id,
        });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Failed to create user', {
            requestId,
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
}
```

### Required Structured Log Format

All logs **MUST** be JSON formatted with these fields:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Processing request",
  "service": "api-service",
  "version": "1.2.3",
  "environment": "production",
  "requestId": "req-001",
  "context": {
    "method": "POST",
    "path": "/api/v1/users",
    "userId": "usr_456"
  }
}
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `SERVICE_NAME` | Service identifier | `api-service` |
| `SERVICE_VERSION` | Service version | `1.0.0` |
| `ENV_NAME` | Environment name | `production` |

### lib-common-js Logging Checklist

| Check | What to Verify | Status |
|-------|----------------|--------|
| Logger Init | `initializeLogger()` called in bootstrap | Required |
| Middleware | `createLoggingMiddleware(logger)` configured | Required |
| Request Correlation | Logs include `requestId` from headers | Required |
| Structured Format | All logs are JSON formatted | Required |
| Error Logging | Errors include message, stack, and context | Required |
| No Sensitive Data | Passwords, tokens, PII not logged | Required |
| Log Levels | Appropriate levels used (info, warn, error) | Required |

### What not to Do

```typescript
// FORBIDDEN: Using console.log
console.log('Processing user'); // DON'T do this

// FORBIDDEN: Logging sensitive data
logger.info('User login', { password: user.password }); // never

// FORBIDDEN: Unstructured log messages
logger.info(`Processing user ${userId}`); // DON'T use string interpolation

// CORRECT: Always use lib-common-js structured logging
const logger = initializeLogger(config);
logger.info('Processing user', { userId, requestId }); // Structured fields
```

### Standards Compliance Categories (TypeScript Logging)

When evaluating a codebase for lib-common-js logging compliance, check these categories:

| Category | Expected Pattern | Evidence Location |
|----------|------------------|-------------------|
| Logger Init | `initializeLogger()` | `src/bootstrap/config.ts` |
| Middleware Setup | `createLoggingMiddleware(logger)` | `src/adapters/http/routes.ts` |
| Request Correlation | `requestId` in all logs | Handlers, services |
| JSON Format | Structured JSON output | All log statements |
| Error Logging | Error object with stack trace | Error handlers |
| No console.log | No direct console usage | Entire codebase |
| No Sensitive Data | Passwords, tokens excluded | All log statements |

---

## Health Checks

### Required Endpoints

### Implementation

```typescript
// TypeScript implementation for observability
import { Request, Response } from 'express';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

interface HealthChecker {
    db: Pool;
    redis: Redis;
}

// Liveness - is the process alive?
function livenessHandler(req: Request, res: Response): void {
    res.status(200).send('OK');
}

// Readiness - can we serve traffic?
async function readinessHandler(
    checker: HealthChecker,
    req: Request,
    res: Response
): Promise<void> {
    const checks = [
        { name: 'database', fn: () => checker.db.query('SELECT 1') },
        { name: 'redis', fn: () => checker.redis.ping() },
    ];

    const failures: string[] = [];
    for (const check of checks) {
        try {
            await Promise.race([
                check.fn(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 5000)
                ),
            ]);
        } catch (err) {
            failures.push(`${check.name}: ${(err as Error).message}`);
        }
    }

    if (failures.length > 0) {
        res.status(503).json({ status: 'unhealthy', checks: failures });
        return;
    }

    res.status(200).json({ status: 'healthy' });
}
```

### Kubernetes Configuration

```yaml
# Observability configuration
# JSON structured logging required
# OpenTelemetry tracing recommended for distributed systems
```

---

## Checklist

Before deploying to production:

- [ ] **Logging**: Structured JSON logs with trace correlation
- [ ] **Tracing**: OpenTelemetry instrumentation
- [ ] **Structured Logging**: lib-common-js integration (TypeScript)
