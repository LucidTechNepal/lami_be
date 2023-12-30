const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const errorConverter = (error, res, req, next) => {
  let err = error;
  if (!(err instanceof ApiError)) {
    const statusCode =
      err.statusCode || err instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatus[statusCode];
    err = new ApiError(statusCode, message, false, error.stack);
  }
  next(err);
};
const errorHandler = (error, req, res, next) => {
  let { statusCode, message } = error;
  if ((config.env = "production" && !error.isOperational)) {
    (statusCode = httpStatus.INTERNAL_SERVER_ERROR),
      (message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
  }

  res.locals.errorMessage = error.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if ((config.env = "development")) {
    console.log(error);
  }
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
