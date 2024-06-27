const Notify = require("../models/Notify");
const School = require("../models/School");
const User = require("../models/User");

const test = async (req, res) => {
  res.status(200).json({ msg: "Notify api is running..." });
};

// @route   POST api/v1/notify/addnotify
// @desc    Add Notification
// @access  Private
const addNotify = async (req, res) => {
  try {
    const admin = req.user;
    const { content, school, level, student } = req.body;
    const schoolNotify = await School.findOne({ schoolName: school });
    const stuNotify = await User.findOne({ name: student });
    const newNotify = new Notify({
      createdBy: admin._id,
      content: content,
    });
    await newNotify.save();
    let query = {};
    if (school) {
      query.school = schoolNotify._id;
    }

    if (level) {
      query.level = level;
    }

    if (student) {
      query._id = stuNotify._id;
    }

    query.role = "student";

    const users = await User.find(query)
      .populate("school", "schoolName")
      .select("-password");
    users.map((user) => {
      user.notify.unshift(newNotify._id);
      user.save();
    });
    newNotify.populate("createdBy", ["name", "avatar"]).then(() => {
      res.status(200).json({ success: true, data: { newNotify } });
    });
    // res.status(200).json({ data: { users } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Add Notify).", error: error.message });
  }
};

// @route   DELETE api/v1/notify/admindeletenotify/:notify_id
// @desc    DELETE Notification
// @access  Private
const adminDeleteNotify = async (req, res) => {
  try {
    const notify_id = req.params.notify_id;
    const deletedNotify = await Notify.findByIdAndDelete(notify_id);
    if (!deletedNotify) {
      return await res.status(404).json({ msg: "Notification not found." });
    }
    const users = await User.find({ notify: notify_id }).select("-password");
    users.map(async (user) => {
      const userNotifyIndex = await user.notify.indexOf(notify_id);
      if (userNotifyIndex === -1) {
        return res.status(404).json({ msg: "User's notification not found." });
      }
      user.notify.splice(userNotifyIndex, 1);
      user.save();
    });
    res.status(200).json({ success: true, data: { deletedNotify } });
  } catch (error) {
    res.status(500).json({
      msg: "Server error(Admin Delete Notify).",
      error: error.message,
    });
  }
};

// @route   GET api/v1/notify/allnotifys
// @desc    Get All Notifications
// @access  Private
const allNotifys = async (req, res) => {
  try {
    const allNotifys = await Notify.find()
      .populate("createdBy", ["name", "avatar"])
      .sort({ date: -1 });
    if (!allNotifys) {
      return res.status(404).json({ msg: "All Notifications not found." });
    }
    res.status(200).json({ success: true, data: { allNotifys } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(All Notifications).", error: error.message });
  }
};

// @route   DELETE api/v1/notify/studeletenotify/:stunotify_id
// @desc    Delete notification for student
// @access  Public
const stuDeleteNotify = async (req, res) => {
  try {
    const stunotify_id = req.params.stunotify_id;
    const student_id = req.user._id;
    const student = await User.findById(student_id);
    if (!student) {
      return res.status(404).json({ msg: "User not found." });
    }
    const userNotifyIndex = await student.notify.indexOf(stunotify_id);
    if (userNotifyIndex === -1) {
      return res.status(404).json({ msg: "User's notification not found." });
    }
    student.notify.splice(userNotifyIndex, 1);
    await student.save();
    res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(User Delete Notify).", error: error.message });
  }
};

module.exports = {
  test,
  addNotify,
  adminDeleteNotify,
  allNotifys,
  stuDeleteNotify,
};
