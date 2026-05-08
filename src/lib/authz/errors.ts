export class ForbiddenError extends Error {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
