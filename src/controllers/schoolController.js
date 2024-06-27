const School = require("../models/School");

const test = async (req, res) => {
  res.status(200).json({ msg: "School api is running." });
};

// @route   GET api/v1/school/all
// @desc    All Schools
// @access  Publish
const all = async (req, res) => {
  try {
    await School.find()
      .then((schools) =>
        res.status(200).json({ success: true, data: { schools } })
      )
      .catch((err) =>
        res.status(400).json({ msg: "Schools not found.", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(All Schools).", error: error.message });
  }
};

// @route   POST api/v1/school/add
// @desc    Add Schools
// @access  Private
const addSchool = async (req, res) => {
  try {
    const { schoolName, description } = req.body;
    await School.findOne({ schoolName: schoolName }).then((school) => {
      if (school) {
        return res.status(400).json({ msg: "School already exists." });
      }
      const newSchool = new School({
        schoolName: schoolName,
        description: description,
      });
      newSchool
        .save()
        .then(() =>
          res.status(200).json({ success: true, data: { newSchool } })
        )
        .catch((err) =>
          res
            .status(500)
            .json({ msg: "New School save error.", err: err.message })
        );
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Add School)", error: error.message });
  }
};

// @route   POST api/v1/school/delete/:school_id
// @desc    Delete school
// @access  Private
const deleteSchool = async (req, res) => {
  try {
    const school_id = req.params.school_id;
    await School.findByIdAndDelete(school_id).then((deleteSchool) => {
      if (!deleteSchool) {
        return res.status(400).json({ msg: "School not found." });
      }
      School.find().then((schools) => {
        res.status(200).json({
          success: true,
          data: { schools },
        });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Delete School)", error: error.message });
  }
};

module.exports = { test, all, addSchool, deleteSchool };
