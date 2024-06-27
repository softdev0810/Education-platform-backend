const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();
const secretOrKey = process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE;

module.exports = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ msg: "No token, authentication denied." });
      }
      jwt.verify(token, secretOrKey, (error, decoded) => {
        if (error) {
          return res.status(401).json({ msg: "Token is not valid." });
        }
        User.findById(decoded._id)
          .then((user) => {
            req.user = user;
            next();
          })
          .catch(() => {
            return res.status(401).json({ msg: "User token is not valid." });
          });
      });
    }
  } catch (error) {
    console.error("Something wrong with auth middleware.", error);
  }
};
