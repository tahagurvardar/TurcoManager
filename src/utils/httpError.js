class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const notFound = (message) => new HttpError(404, message);
const badRequest = (message) => new HttpError(400, message);
const forbidden = (message) => new HttpError(403, message);

module.exports = {
  HttpError,
  notFound,
  badRequest,
  forbidden,
};
