# Multi-Tenant Analysis Checklist (MANDATORY)

**⛔ MULTI-TENANT ANALYSIS (MANDATORY):**

**Existence ≠ Compliance.** Code that has "some multi-tenant" but does not match the MarsAI canonical model is NON-COMPLIANT and MUST be flagged as a gap.

## Compliance Audit

1. **Detection:** Check if any multi-tenant code exists (`MULTI_TENANT_ENABLED`, tenant middleware, tenant context)
2. **If multi-tenant code exists → run compliance audit:**
   - Config vars: MUST use canonical `MULTI_TENANT_*` names (not custom env var names)
   - Middleware: MUST use tenant middleware with proper database/cache context options
   - Route ordering: Auth MUST run before tenant middleware — per-route (not global)
   - Repositories: MUST use tenant-aware context for database operations (not static connections)
   - Redis: MUST use tenant-aware key operations
   - Circuit breaker: MUST have circuit breaker on Tenant Manager client
   - Backward compat: MUST have backward compatibility test
   - Non-canonical files: MUST NOT have custom tenant packages (custom middleware, custom tenant resolution)
   - Each non-compliant item → ISSUE-XXX with severity based on impact
3. **If multi-tenant code is MISSING entirely** → ISSUE-XXX (CRITICAL): "Service does not support multi-tenant mode."
4. **If non-compliant** → ISSUE-XXX per component: "Multi-tenant [component] is non-compliant. MUST be replaced with canonical pattern."
5. **Backward compatibility:** Service MUST work with `MULTI_TENANT_ENABLED=false` (default) and without any `MULTI_TENANT_*` env vars

## Performance & Operational Readiness

**These checks apply when multi-tenant IS implemented. Flag as ISSUE-XXX if missing.**

### Connection Pool Health
```bash
# Check pool configuration is parameterized (not hardcoded)
grep -rn "maxConnections\|poolSize\|idleTimeout" src/ --include="*.ts"
# Expected: Pool limits come from config (env vars), not hardcoded values
```
- ISSUE if pool limits are hardcoded → MEDIUM: "Pool limits MUST come from MULTI_TENANT_MAX_TENANT_POOLS config"
- ISSUE if idle timeout is missing → MEDIUM: "MUST configure idle timeout to prevent connection leaks"

### Circuit Breaker Configuration
```bash
# Verify circuit breaker is configured with env-driven thresholds
grep -rn "circuitBreaker\|CircuitBreaker" src/ --include="*.ts"
# Expected: threshold and timeout come from config, not hardcoded
```
- ISSUE if circuit breaker uses hardcoded values → MEDIUM: "Circuit breaker thresholds MUST come from MULTI_TENANT_CIRCUIT_BREAKER_* config"

### Graceful Shutdown
```bash
# Verify managers are closed on shutdown
grep -rn "\.close()\|\.shutdown()\|onModuleDestroy\|beforeApplicationShutdown" src/ --include="*.ts"
# Expected: Connection managers closed in shutdown hooks
```
- ISSUE if managers not closed on shutdown → HIGH: "Connection managers MUST be closed on graceful shutdown to prevent leaks"

### Error Handling Completeness
```bash
# Verify tenant errors are handled
grep -rn "TenantNotFoundError\|CircuitBreakerOpenError\|TenantContextRequired" src/ --include="*.ts"
# Expected: All tenant error types handled in middleware or error handler
```
- ISSUE if tenant errors not handled → HIGH: "Multi-tenant error [name] not handled."

### Single-Tenant Adaptability (for non-MT codebases analyzed by dev-refactor)
```bash
# Check for global DB singletons (non-MT-adaptable)
grep -rn "const.*=.*createConnection\|const.*=.*new Pool\|const.*=.*createClient" src/ --include="*.ts" | grep -v ".spec.ts\|.test.ts"
# Expected: 0 matches. Database connections should be injected via DI, not module-level constants.
```
- ISSUE if global DB singletons found → HIGH: "Module-level database variable blocks per-tenant connection routing. Refactor to DI-injected service."
