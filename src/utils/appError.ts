export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(
    message: string, 
    public readonly statusCode: number, 
    isOperational = true, 
    errors?: any[]
  ) {
    super(message);
    this.isOperational = isOperational;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud incorrecta", errors?: any[]) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto en el recurso") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Error de validación", errors: any[]) {
    super(message, 400, true, errors);
  }
}