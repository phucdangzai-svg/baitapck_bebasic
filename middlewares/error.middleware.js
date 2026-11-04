export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Không tìm thấy: ${req.method} - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi hệ thống - Internal Server Error";

  console.error(
    `[ERROR] ${statusCode} - ${req.method} ${req.url} - ${message}`,
  );
  if (statusCode === 500) {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    timestamp: new Date().toISOString(),
  });
};
