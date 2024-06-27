const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const secretOrKey = process.env.JWT_ACCESS_TOKEN_SECRET_PRIVATE;

// @route   POST api/v1/auth/sendcode
// @desc    Send verify code
// @access  Public
const sendCode = async (req, res) => {
  const email = req.body.email;
  try {
    await User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ msg: "This email is not exist." });
        }
        const VERIFY_CODE = Math.floor(100000 + Math.random() * 900000);
        user.active = VERIFY_CODE;
        user
          .save()
          .then()
          .catch((error) =>
            res
              .status(400)
              .json({ msg: "User active is not saved", err: error.message })
          );
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
          // service: "gmail",
        });
        process.env.GENERATED_TIME = Date.now();
        const mailOptions = {
          from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
          to: email,
          subject: `Your verification code is ${VERIFY_CODE}`,
          text: "code",
          html: `<h1>Verify your email address</h1>
          <hr><h3>Please enter this 6-digit code to access our platform.</h3>
          <h1>${VERIFY_CODE}</h1>`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            res.status(400).json({ msg: "Send Mail error.", err: err.message });
          }
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
                msg: "Email sent successfully",
                data: { active: user.active, token: "Bearer " + token },
              });
            }
          );
        });
      })
      .catch((error) =>
        res.status(500).json({ msg: "User verify error", err: error.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Send Code).", err: error.message });
  }
};

// @route   POST api/v1/auth/verifycode
// @desc    Verify Code
// @access  Public
const verifyCode = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const active = req.body.active;
      if (!token) {
        return res.status(401).json({ msg: "No verify token." });
      }
      await jwt.verify(token, secretOrKey, (error, decode) => {
        if (error) {
          return res.status(401).json({ msg: "Verify token is not valid." });
        }
        User.findById(decode._id).then((user) => {
          if (user.active == active) {
            user.active = 1;
            user
              .save()
              .then(() => {
                res.status(200).json({
                  success: true,
                  active: user.active,
                  data: "Verify Passed.",
                });
              })
              .catch((err) =>
                res
                  .status(400)
                  .json({ msg: "active <= One error.", err: err.message })
              );
          } else {
            res
              .status(400)
              .json({ active, msg: "The code is incorrect, try again" });
          }
        });
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Verify Code).", err: error.message });
  }
};

module.exports = { sendCode, verifyCode };
