// Centralized error handlers

export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  // Default status
  const status = err.status || err.statusCode || 500;

  // Basic Prisma error shape support
  const isPrisma = err?.code && typeof err.code === "string" && err.code.startsWith("P");

  // Hide internal details in production-like responses
  const response = {
    message: err.message || "Internal server error",
  };

  // Helpful metadata in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    if (isPrisma) response.prisma = { code: err.code, meta: err.meta };
  }

  // Log the error
  // eslint-disable-next-line no-console
  console.error("ErrorHandler:", { message: err.message, code: err.code, stack: err.stack });

  res.status(status).json(response);
};


