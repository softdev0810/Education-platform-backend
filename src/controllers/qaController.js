const Question = require("../models/Question");
const School = require("../models/School");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Answer = require("../models/Answer");

const test = async (req, res) => {
  res.status(200).json({ msg: "Question api is running..." });
};

// @route   POST api/v1/qa/addques
// @desc    Add Question
// @access  Private
const addQues = async (req, res) => {
  try {
    const { topic, question, subject, level, type, list } = req.body;
    const newQuestion = new Question({
      createdBy: req.user._id,
      topic: topic,
      question: question,
      // subject: subject,
      level: level,
      type: type,
      list: list,
    });
    await Subject.findOne({ subjectName: subject })
      .then((subject) => {
        subject.questions.push(newQuestion._id);
        newQuestion.subject = subject._id;
        subject.save();
        newQuestion.save();
        newQuestion
          .populate("subject", "subjectName")
          .then(() =>
            res.status(200).json({ success: true, data: { newQuestion } })
          );
      })
      .catch((err) =>
        res
          .status(400)
          .json({ msg: "New Question save error", err: err.message })
      );
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Add Question).", error: error.message });
  }
};

// @route   PUT api/v1/qa/updateques/:updateques_id
// @desc    PUT update Question
// @access  Private
const updateQues = async (req, res) => {
  try {
    const updateques_id = req.params.updateques_id;
    const { topic, question, subject, level, type, list } = req.body;
    const foundSubject = await Subject.findOne({ subjectName: subject });
    if (!foundSubject) {
      return res.status(404).json({ msg: "Subject not found." });
    }
    await Question.findByIdAndUpdate(updateques_id, {
      topic,
      question,
      subject: foundSubject._id,
      level,
      type,
      list,
    });
    await Question.findById(updateques_id)
      .populate("subject", "subjectName")
      .then((updatedques) => {
        res.status(200).json({ success: true, data: { updatedques } });
      });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Update Question).", error: error.message });
  }
};

// @route   DELETE api/v1/qa/deleteques/:deleteques_id
// @desc    Delete Question
// @access  Private
const deleteQues = async (req, res) => {
  try {
    const deleteques_id = req.params.deleteques_id;
    const deletedQuestion = await Question.findByIdAndDelete(deleteques_id);

    if (!deletedQuestion) {
      return res.status(404).json({ msg: "Question not found." });
    }

    const quesSubject = deletedQuestion.subject;

    const usersDeletedQuestion = await User.find({
      "userAnswers.subject": quesSubject,
    });

    for (const user of usersDeletedQuestion) {
      const cQs = user.userAnswers;
      const cSQs = cQs.filter(
        (cQ) => cQ.subject.toString() === quesSubject.toString()
      );
      const correctquestions = cSQs[0].correctQuestions;
      const correctindex = correctquestions.findIndex(
        (ques) => ques.question.toString() === deleteques_id.toString()
      );
      if (correctindex !== -1) {
        correctquestions.splice(correctindex, 1);
        await user.save();

        const school = await School.findById(user.school);
        const schoolCA = school.correctAnsNum.find(
          (cA) => cA.subject.toString() === quesSubject.toString()
        );
        schoolCA.correctNum -= 1;
        await school.save();
      }
      const answerquestions = cSQs[0].answerQuestions;
      const answerindex = answerquestions.findIndex(
        (ques) => ques.question.toString() === deleteques_id.toString()
      );
      if (answerindex !== -1) {
        answerquestions.splice(answerindex, 1);
        await user.save();
      }
    }

    const deletedQuesSubject = await Subject.findById(quesSubject);
    deletedQuesSubject.questions = deletedQuesSubject.questions.filter(
      (question) => question.toString() !== deleteques_id
    );
    await deletedQuesSubject.save();

    // Mongoose's deleteMany() method to delete multiple documents from the "Answer" collection where the question field matches the value of deleteques_id.
    await Answer.deleteMany({ question: deleteques_id });

    // res.status(200).json({ success: true, data: { deletedQuestion } });
    const questions = await Question.find()
      .populate("subject", "subjectName")
      .populate({
        path: "answers",
        select: "-question",
        populate: { path: "student", select: "name" },
      });
    res.status(200).json({ success: true, data: { questions } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Delete Question).", error: error.message });
  }
};

// @route   GET api/v1/qa/allquesans
// @desc    GEt All Questions and Answers
// @access  Private
const allQuesAns = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ questionDate: -1 })
      .populate("subject", "subjectName")
      .populate({
        path: "answers",
        select: "-question",
        populate: { path: "student", select: "name" },
      });
    res.status(200).json({ success: true, data: { questions } });
  } catch (error) {
    res.status(500).json({
      msg: "Server error(All Question and Answer).",
      error: error.message,
    });
  }
};

// @route   GET api/v1/qa/stuques
// @desc    Get answered Question and Answer for Student.
// @access  Public
const stuQues = async (req, res) => {
  try {
    const student = req.user;
    const questions = await Question.find({ level: student.level })
      .sort({ questionDate: -1 })
      .populate("subject", "subjectName")
      .select("-answers");
    if (questions.length > 0) {
      const stuQuestion = await Promise.all(
        questions.map(async (question) => {
          const stuAnswer = await Answer.findOne({
            question: question._id,
            student: student._id,
          }).select("-question -student");
          return { question, stuAnswer };
        })
      );
      res.status(200).json({ success: true, data: { stuQuestion } });
    } else {
      res.status(404).json({ msg: "Questions not found for the student." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(Student Question).", error: error.message });
  }
};

// @route   POST api/v1/qa/addans/:ques_id
// @desc    Add Answer
// @access  Public
const addAns = async (req, res) => {
  try {
    const stu_id = req.user._id;
    const ques_id = req.params.ques_id;
    const answerText = req.body.answer;

    const question = await Question.findById(ques_id);
    const answer = await Answer.findOne({ question: ques_id, student: stu_id });

    if (answer) {
      return res.status(400).json({ msg: "Answer already exists." });
    }
    if (!answerText) {
      return res.status(400).json({ msg: "Answer is required." });
    }
    const newAnswer = new Answer({
      student: stu_id,
      question: ques_id,
      answer: answerText,
    });

    await newAnswer.save();
    question.answers.unshift(newAnswer._id);
    await question.save();

    const student = await User.findById(newAnswer.student);
    if (!student) {
      return res.status(404).json({ msg: "Student not found." });
    }
    const stuCorrect = student.userAnswers.find(
      (cq) => cq.subject.toString() === question.subject.toString()
    );
    const answerquestion = { question: ques_id };
    if (!stuCorrect) {
      student.userAnswers.unshift({
        subject: question.subject,
        answerQuestions: [answerquestion],
      });
    } else {
      stuCorrect.answerQuestions.unshift(answerquestion);
    }
    await student.save();

    res.status(200).json({ success: true, data: { newAnswer } });
    Question.find();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error (Add answer).", error: error.message });
  }
};

// @route   GET api/v1/qa/stuquesans
// @desc    Get answered Question and Answer for Student.
// @access  Public
const stuQuesAns = async (req, res) => {
  try {
    const stu_id = req.user._id;
    const questions = await Question.find({
      "answers.student": stu_id,
      "answers.isCorrect": true,
    }).populate("subject", "subjectName");
    if (questions.length > 0) {
      const stuAnswer = questions.map((question) => {
        const meAnswer = question.answers.find(
          (ans) => ans.student.toString() === stu_id.toString()
        );
        return {
          topic: question.topic,
          question: question.question,
          subject: question.subject,
          level: question.level,
          date: question.questionDate,
          answer: meAnswer
            ? {
                answer: meAnswer.answer,
                isCorrect: meAnswer.isCorrect,
                answerDate: meAnswer.answerDate,
              }
            : null,
        };
      });
      res.status(200).json({ success: true, data: { stuAnswer } });
    } else {
      res
        .status(404)
        .json({ msg: "Answered questions not found for the student." });
    }
  } catch (error) {
    res.status(500).json({
      msg: "Server error(Question and Answer).",
      error: error.message,
    });
  }
};

// @route   POST api/v1/qa/trueans/:ques_id/:ans_id
// @desc    True Answer
// @access  Private
const trueAns = async (req, res) => {
  try {
    const { ques_id, ans_id } = req.params;
    const question = await Question.findById(ques_id);
    const answer = await Answer.findOne({ _id: ans_id, question: ques_id });
    if (answer) {
      if (answer.isCorrect) {
        return res.status(400).json({ msg: "This Answer already true." });
      }
      answer.isCorrect = true;
      await answer.save();

      const student = await User.findById(answer.student);
      if (!student) {
        return res.status(404).json({ msg: "Student not found." });
      }
      const stuCorrect = student.userAnswers.find(
        (cq) => cq.subject.toString() === question.subject.toString()
      );
      const correctquestion = { question: ques_id };
      if (!stuCorrect) {
        student.userAnswers.unshift({
          subject: question.subject,
          correctQuestions: [correctquestion],
        });
      } else {
        stuCorrect.correctQuestions.unshift(correctquestion);
      }
      await student.save();

      const school = await School.findById(student.school);
      if (!school) {
        return res.status(404).json({ msg: "School not found." });
      }
      const schoolCorrect = school.correctAnsNum.find(
        (ca) => ca.subject.toString() === question.subject.toString()
      );
      if (!schoolCorrect) {
        school.correctAnsNum.push({
          subject: question.subject,
          correctNum: 1,
        });
      } else {
        schoolCorrect.correctNum += 1;
      }
      await school.save();

      res.status(200).json({ success: true, msg: "Answer marked as correct." });
    } else {
      res.status(404).json({ msg: "Answer not found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error (True Answer).", error: error.message });
  }
};

module.exports = {
  test,
  addQues,
  updateQues,
  deleteQues,
  allQuesAns,
  stuQues,
  addAns,
  stuQuesAns,
  trueAns,
};
