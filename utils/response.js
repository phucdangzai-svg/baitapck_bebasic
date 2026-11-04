export const sendSuccess = (res, data, message, status) => {
  res.status(status || 200).json({
    success: true,
    message: message || "OK",
    data,
  });
};