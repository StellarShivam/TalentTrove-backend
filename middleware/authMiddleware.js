const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const HttpError = require("../models/http-error");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = { userId: decoded.userId };

      next();
    } catch (e) {
      const error = new HttpError("Not authorized, login please1.", 401);
      return next(error);
    }
  }

  if (!token) {
    const error = new HttpError("Not authorized, login please.", 401);
    return next(error);
  }
});

module.exports = { protect };
