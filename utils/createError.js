export const createError = (status, message, details) => {
  const err = new Error(message);
  err.statusCode = status;
  if (details) {
    err.details = details;
  }
  return err;
};