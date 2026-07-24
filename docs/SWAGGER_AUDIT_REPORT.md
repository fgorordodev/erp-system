# Backend Swagger and infrastructure audit report

Audit scope: uploaded `erp-system-main` archive, with emphasis on `apps/backend`, API contracts, Swagger/OpenAPI generation, tests and CI.

Audit date: 2026-07-24

## Executive result

The backend had a functional Swagger bootstrap and partial Users documentation, but the published schema did not accurately describe the runtime HTTP contract. Authentication DTOs and responses were mostly invisible to OpenAPI, Health had no response model, protected/error responses were inconsistent, and no automated contract-generation or validation step existed.

The repository has been corrected so Swagger is now treated as a versioned API contract rather than a UI-only development aid.

## Findings and corrections

### 1. Runtime response envelopes were undocumented

**Finding:** `ResponseInterceptor` wraps successful payloads in `{ success, data, timestamp, path }`, while controller decorators documented raw DTOs.

**Correction:** Added reusable `ApiSuccessResponseDto`, `ApiOkEnvelope()` and `ApiCreatedEnvelope()` schemas using `ApiExtraModels` and `getSchemaPath`.

### 2. Error contracts were duplicated and underspecified

**Finding:** Exception filters emitted a stable error envelope, but Swagger responses only contained descriptions.

**Correction:** Added `ApiErrorResponseDto`, `ApiErrorDetailDto` and reusable validation/protected/internal error decorators. Domain-specific `404` and `409` responses now reference the actual schema.

### 3. Authentication endpoints were largely undocumented

**Finding:** Login and refresh had no operation descriptions, response DTOs, examples, validation metadata or documented failure contracts.

**Correction:** Added complete Login/Refresh/Logout documentation, `LoginResponseDto`, `TokenPairResponseDto`, secret-field metadata and explicit token-rotation behavior.

### 4. Health contract was implicit

**Finding:** The Health endpoint had an operation description but no success or service-unavailable schema.

**Correction:** Added typed health DTOs and documented readiness/database behavior.

### 5. Swagger setup was coupled to `main.ts`

**Finding:** Application configuration and document generation could not be reused reliably by tests or scripts.

**Correction:** Extracted `configureApplication()`, `createSwaggerDocument()` and `configureSwagger()` with stable paths and operation IDs.

### 6. No machine-verifiable OpenAPI pipeline existed

**Finding:** CI could lint/build while accepting undocumented or unsecured new routes.

**Correction:** Added:

- `swagger:generate`
- `swagger:validate`
- reproducible `apps/backend/openapi/openapi.json` generation
- CI contract-validation step
- checks for summaries, tags, responses, unique operation IDs and Bearer security

### 7. E2E bootstrap differed from production

**Finding:** The E2E test did not apply the global `/api` prefix, validation, Helmet or CORS configuration and tested `/health` instead of the actual route.

**Correction:** The test now reuses `configureApplication()` and asserts the real enveloped `/api/health` response.

## Files added

- `apps/backend/src/common/swagger/**`
- `apps/backend/src/modules/auth/dto/login-response.dto.ts`
- `apps/backend/src/modules/auth/dto/token-pair-response.dto.ts`
- `apps/backend/src/modules/health/dto/**`
- `apps/backend/scripts/generate-openapi.ts`
- `apps/backend/scripts/validate-openapi.ts`
- `docs/backend/SWAGGER.md`
- `docs/SWAGGER_AUDIT_REPORT.md`

## Files materially updated

- `apps/backend/src/main.ts`
- `apps/backend/src/config/**`
- Auth, Users and Health controllers/DTOs
- `apps/backend/test/app.e2e-spec.ts`
- root and backend `package.json`
- `.github/workflows/ci.yml`

## Verification status

Static source inspection and repository-level consistency checks were completed. Package installation and executable lint/build/test verification could not be performed inside the audit container because the package manager was not preinstalled and outbound npm registry access failed with DNS error `EAI_AGAIN`.

The repository includes the exact verification commands below and CI will execute them in an environment with dependency access:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm swagger:validate
pnpm --filter @erp/backend test:e2e
```

The E2E health test additionally requires PostgreSQL with migrated/seeded schema as configured by `.env`.

## Remaining roadmap items

These are intentionally not fabricated as completed:

1. Add pagination/filtering/query DTOs before the Users collection grows.
2. Add rate limiting and brute-force protection to login and refresh.
3. Add unit/integration coverage for refresh-token reuse detection and guard behavior.
4. Split liveness from readiness when deployment orchestration is introduced.
5. Add OpenAPI breaking-change detection once a frontend-generated client is adopted.
6. Add organization/tenant boundaries before ERP business modules.

## Readiness decision

The backend documentation infrastructure is ready for continued modular development. New endpoints can now use shared contracts and CI validation, preventing the previous drift between controller behavior and Swagger output.
