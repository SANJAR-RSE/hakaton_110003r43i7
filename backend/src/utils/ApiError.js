// A small typed error so route handlers can `throw new ApiError(404, "...")`
// and the central error middleware turns it into a clean JSON response
// instead of leaking stack traces / "Internal Server Error" to the client.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { ApiError };
