const User = require("../models/User");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const test = async (req, res) => {
  await res.status(200).json({ msg: "User is running" });
};

// @route   GET api/v1/user/me
// @desc    Get user
// @access  Public
const me = async (req, res) => {
  try {
    const user = req.user;
    await User.findById(user._id)
      .populate("school", "schoolName")
      .populate("notify")
      .populate({
        path: "userAnswers",
        populate: { path: "subject", select: "-_id subjectName" },
      })
      .select("-password -role -active")
      .then((user) => res.status(200).json({ success: true, data: { user } }))
      .catch((err) => res.status(404).json({ msg: "No user found." }));
  } catch (error) {
    res.status(500).json({ msg: "Server error(About me).", error: error });
  }
};

// @route   GET api/v1/user/admin
// @desc    Get admin
// @access  Private
const admin = async (req, res) => {
  try {
    const user = req.user;
    await User.findById(user._id)
      .select("-password")
      .then((admin) => res.status(200).json({ success: true, data: { admin } }))
      .catch((err) =>
        res.status(404).json({ msg: "No user found.", err: err.message })
      );
  } catch (error) {
    res.status(500).json({ msg: "Server error(About admin).", error: error });
  }
};

// @route   PUT api/v1/user/updateadmin
// @desc    PUT update admin
// @access  Privat
const updateAdmin = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, avatar, password, newPassword } = req.body;
    await User.findById(user._id)
      .then(async (admin) => {
        if (!admin) {
          return res.status(404).json({ msg: "Admin not found." });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
          if (name) {
            admin.name = name;
          }
          if (email) {
            admin.email = email;
          }
          if (newPassword) {
            admin.password = newPassword;
          }
          if (avatar) {
            admin.avatar = avatar;
          }
          await admin.save();
          return res.status(200).json({ success: true, data: { admin } });
        } else {
          return res.status(400).json({ msg: "Password is incorrect." });
        }
      })
      .catch((err) =>
        res.status(400).json({ msg: "Admin update error.", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Change admin).", error: error.message });
  }
};

// @route   GET api/v1/user/all
// @desc    Get all user
// @access  Private
const all = async (req, res) => {
  await User.find()
    .populate("school", "schoolName")
    .select("-password")
    .sort({ date: 1 })
    .then((users) => res.status(200).json({ success: true, data: { users } }))
    .catch((err) =>
      res.status(404).json({ msg: "No users found.", err: err.message })
    );
};

module.exports = { test, me, all, updateAdmin, admin };
