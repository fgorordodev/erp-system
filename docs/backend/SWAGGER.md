# Swagger and OpenAPI conventions

The backend exposes an OpenAPI 3 document for the real HTTP contract, including the global success/error envelopes applied by interceptors and exception filters.

## Local URLs

- API base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`

Swagger authorization uses the `access-token` security scheme. Paste only the JWT returned by `POST /api/auth/login`; Swagger UI adds the `Bearer` prefix.

## Commands

```bash
pnpm swagger:generate
pnpm swagger:validate
```

The generated contract is written to `apps/backend/openapi/openapi.json`. Validation checks that every operation has a stable `operationId`, tag, summary, documented response and Bearer security when the route is protected.

## Controller checklist

Every new endpoint must include:

- `@ApiTags()` at controller level.
- `@ApiOperation()` with a concise summary and behavioral description.
- A success decorator matching the global envelope: `@ApiOkEnvelope()` or `@ApiCreatedEnvelope()`.
- `@ApiBearerAuth('access-token')` on protected controllers or methods.
- `@ApiProtectedErrors()` for protected operations.
- `@ApiValidationError()` when a body, parameter or query can fail validation.
- Explicit `404`, `409` or other domain-specific error responses.
- `@ApiParam()` and `@ApiQuery()` for route and query inputs.

## DTO checklist

Request and response DTOs are HTTP contracts and must not expose Prisma entities directly.

- Required fields use `@ApiProperty()`.
- Optional fields use `@ApiPropertyOptional()` and `@IsOptional()`.
- Validation metadata and OpenAPI constraints must agree.
- Secrets use `writeOnly: true`.
- Dates use `type: String` and `format: 'date-time'`.
- Enums use `enum` and a stable `enumName`.
- Every field includes a realistic, non-secret example.

## Response envelopes

Successful responses except `204 No Content` use:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-07-24T20:00:00.000Z",
  "path": "/api/example"
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email must be an email",
    "statusCode": 400
  },
  "timestamp": "2026-07-24T20:00:00.000Z",
  "path": "/api/example"
}
```

Shared schemas and decorators live in `apps/backend/src/common/swagger`.

## Adding a module

1. Create request and response DTOs before implementing the controller.
2. Return response DTOs from the service boundary rather than Prisma records.
3. Add the controller tag to `createSwaggerDocument()`.
4. Apply the shared envelope and error decorators.
5. Run `pnpm swagger:validate`.
6. Inspect the generated diff in `openapi/openapi.json` before committing.
