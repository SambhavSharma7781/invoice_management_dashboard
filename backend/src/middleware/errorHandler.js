export const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: error.message || "Server error",
      ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    },
  });
};
