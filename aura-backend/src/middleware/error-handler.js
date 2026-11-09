function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const isClientError = status >= 400 && status < 500;

  if (status >= 500) {
    console.error("Request failed:", error);
  }

  response.status(status).json({
    success: false,
    message: isClientError ? error.message : "Something went wrong",
    error: {
      code: error.code || (status === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR")
    }
  });
}

module.exports = errorHandler;
