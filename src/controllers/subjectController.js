const Subject = require("../models/Subject");

const test = async (req, res) => {
  res.status(200).json({ msg: "Subject api is running." });
};

// @route   GET api/v1/subject/all
// @desc    All Schools
// @access  Publish
const all = async (req, res) => {
  try {
    await Subject.find()
      .then((subjects) => {
        // const allSubjects = subjects.map((subject) => {
        // //   const questionNum = subject.questions.length();
        //   return {
        //     name: subject.name,
        //     questionNum: questionNum,
        //   };
        // });

        res.status(200).json({ success: true, data: { subjects } });
      })
      .catch((err) =>
        res.status(500).json({ msg: "Subjects not found.", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(All Subjects).", error: error.message });
  }
};

// @route   POST api/v1/subject/add
// @desc    Add Schools
// @access  Private
const addSubject = async (req, res) => {
  try {
    const { subjectName } = req.body;
    Subject.findOne({ subjectName: subjectName }).then((subject) => {
      if (subject) {
        return res.status(400).json({ msg: "Subject already exists." });
      }
      const newSubject = new Subject({
        subjectName: subjectName,
      });
      newSubject
        .save()
        .then(() =>
          // Subject.find().then((subjects) => {
          //   res.status(200).json({ success: true, data: { subjects } });
          // })
          res.status(200).json({ success: true, data: { newSubject } })
        )
        .catch((err) =>
          res
            .status(500)
            .json({ msg: "New Subject save error.", err: err.message })
        );
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Add Subject)", error: error.message });
  }
};

// @route   DELETE api/v1/subject/delete/:subject_id
// @desc    Delete subject
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject_id = req.params.subject_id;
    await Subject.findByIdAndDelete(subject_id).then((deleteSubject) => {
      if (!deleteSubject) {
        return res.status(400).json({ msg: "Subject not found." });
      }
      Subject.find().then((subjects) => {
        res.status(200).json({
          success: true,
          data: { subjects },
        });
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Delete Subject)", error: error.message });
  }
};

// @route   POST api/v1/subject/addtopic/:subject_id
// @desc    Add topic of subject
// @access  Private
const addTopic = async (req, res) => {
  try {
    const subject_id = req.params.subject_id;
    const { topic } = req.body;
    await Subject.findById(subject_id)
      .then((subject) => {
        const sameTopic = subject.topic.find(
          (subjectTopic) => subjectTopic === topic
        );
        if (sameTopic) {
          return res.status(400).json({ msg: "Topic already exists." });
        }
        if (!topic) {
          return res.status(400).json({ msg: "Topic is required." });
        }
        subject.topic.push(topic);
        subject.save().then(() =>
          // res.status(200).json({ success: true, data: { subject } })
          Subject.find().then((subjects) =>
            res.status(200).json({ success: true, data: { subjects } })
          )
        );
      })
      .catch((err) =>
        res.status(500).json({ msg: "Subject not found.", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Add Topic).", error: error.message });
  }
};

module.exports = { test, all, addSubject, deleteSubject, addTopic };
