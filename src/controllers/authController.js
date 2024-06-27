const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const dotenv = require("dotenv");
const User = require("../models/User");
const School = require("../models/School");

dotenv.config();
const secretOrKey = process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE;
const expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES;

const test = async (req, res) => {
  await res.status(200).json({ msg: "Auth is running." });
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, school, level, role } = req.body;

    await User.findOne({ email }).then((user) => {
      if (user) {
        // errors.email = "Email already exists.";
        // don't proceed because the user exists
        return res.status(400).json({ msg: "User already exists." });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      // if user doesn't exist, create new User
      const newUser = new User({
        name: name,
        email: email,
        password: password,
        avatar: avatar,
        // school: school,
        level: level,
        role: role,
      });

      newUser
        .save()
        .then((user) => {
          if (user.role === "student") {
            School.findOne({ schoolName: school })
              .then((school) => {
                if (school) {
                  school.students.push(user._id);
                  user.school = school._id;
                  user.save();
                  school.save();
                } else {
                  return res
                    .status(404)
                    .json({ msg: "School not found(Register)." });
                }
              })
              .catch((err) =>
                res.status(400).json({
                  msg: "User's School save error.",
                  err: err.message,
                })
              );
          }
          res.status(200).json({ success: true, data: { user } });
        })
        .catch((err) =>
          res.status(500).json({ msg: "User save error.", err: err.message })
        );
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Register).", error: error.message });
  }
};

// @route   POST api/v1/auth/login
// @desc    Login a user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // find user by email
    await User.findOne({ email })
      .populate("school", "schoolName")
      .then((user) => {
        // check for user
        if (!user) {
          return res.status(400).json({ msg: "User not found." });
        }
        // check for password
        bcrypt.compare(password, user.password).then((isMatch) => {
          if (isMatch) {
            // user matched
            // create JWT payload
            const payload = {
              _id: user._id,
              email: user.email,
            };
            // sign token
            jwt.sign(
              payload,
              secretOrKey,
              { expiresIn: expiresIn },
              (err, token) => {
                user.visitTime.unshift({
                  login: new Date(),
                });
                user.save();
                res.status(200).json({
                  success: true,
                  data: { user, token: "Bearer " + token },
                });
              }
            );
          } else {
            return res.status(400).json({ msg: "Incorrect password entered." });
          }
        });
      });
  } catch (error) {
    res.status(500).json({ msg: "Server error(Login)", error: error.message });
  }
};

// @route   POST api/v1/auth/logout
// @desc    Logout a user
// @access  Public
const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    } else {
      user.visitTime[0].logout = new Date();
      await user.save().then(() => {
        res
          .status(200)
          .clearCookie()
          .json({ success: true, msg: "Successfully logouted" });
      });
    }
  } catch (error) {
    await res.status(500).json({ msg: "Server error" });
  }
};

// @route   PUT api/v1/auth/forgotpassword
// @desc    PUT user forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    user.password = password;
    await user
      .save()
      .then((user) => {
        // create JWT payload
        const payload = {
          _id: user._id,
        };
        // sign token
        jwt.sign(
          payload,
          secretOrKey,
          // { expiresIn: expiresIn },
          (err, token) => {
            res.status(200).json({
              success: true,
              data: { user, token: "Bearer " + token },
            });
          }
        );
      })
      .catch((err) =>
        res.status(400).json({ msg: "User save error.", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(FogotPassword).", error: error.message });
  }
};

module.exports = { test, register, login, logout, forgotPassword };
