const School = require("../models/School");
const Subject = require("../models/Subject");

const test = async (req, res) => {
  await res.status(200).json({ msg: "Rank is running.." });
};

const rankSchoolBySubject = async (schools, subjectId) => {
  const rankedSchools = schools.map((school) => {
    let score = 0;

    school.correctAnsNum.forEach((correctAns) => {
      if (correctAns.subject._id.toString() === subjectId.toString()) {
        score += correctAns.correctNum;
      }
    });

    return {
      school: school.schoolName,
      score,
    };
  });

  const sortedRankedSchools = rankedSchools.sort((a, b) => b.score - a.score);

  const topRankedSchool = sortedRankedSchools[0];

  return topRankedSchool;
};

const rankStudentBySubject = async (students, subjectId) => {
  const rankedStudents = students.map((student) => {
    let score = 0;

    student.userAnswers.forEach((correctQues) => {
      if (correctQues.subject.toString() === subjectId.toString()) {
        score += correctQues.correctQuestions.length;
      }
    });

    return {
      student: student.name,
      level: student.level,
      avatar:student.avatar,
      score,
    };
  });

  const sortedRankedStudents = rankedStudents.sort((a, b) => b.score - a.score);

  const topRankedStudent = sortedRankedStudents[0];

  return topRankedStudent;
};

// @route   GET api/v1/rank/schoolrank
// @desc    Get rank of School
// @access  Public
const rankSchool = async (req, res) => {
  try {
    const mathSubject = await Subject.findOne({ subjectName: "Matemática" });
    const math_id = mathSubject._id;
    const portSubject = await Subject.findOne({ subjectName: "Português" });
    const port_id = portSubject._id;

    const schools = await School.find()
      .select("-students")
      .populate("correctAnsNum.subject", "subjectName");

    const mathRank = await rankSchoolBySubject(schools, math_id);

    const portRank = await rankSchoolBySubject(schools, port_id);

    const rankedSchools = schools.map((school) => {
      let score = 0;

      school.correctAnsNum.forEach((correctAns) => {
        score += correctAns.correctNum;
      });

      return {
        school: school.schoolName,
        score,
      };
    });

    const total = rankedSchools.sort((a, b) => b.score - a.score);

    res
      .status(200)
      .json({ success: true, data: { mathRank, portRank, total } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(School rank).", error: error.message });
  }
};

// @route   GET api/v1/rank/studentrank
// @desc    Get rank of Users in School
// @access  Public
const rankUser = async (req, res) => {
  try {
    // Find the school of the current user
    const mathSubject = await Subject.findOne({ subjectName: "Matemática" });
    const math_id = mathSubject._id;
    const portSubject = await Subject.findOne({ subjectName: "Português" });
    const port_id = portSubject._id;
    const studentSchool = await School.findOne({
      students: req.user._id,
    }).populate({
      path: "students",
      populate: {
        path: "userAnswers",
      },
    });
    const students = studentSchool.students;
    // console.log(students);

    const mathRank = await rankStudentBySubject(students, math_id);

    const portRank = await rankStudentBySubject(students, port_id);

    const rankedStudents = students.map((student) => {
      let score = 0;

      const answers = student.userAnswers

      answers.forEach((answer) => {
        score += answer.correctQuestions.length;
      });

      return {
        student: student.name,
        level: student.level,
        avatar:student.avatar,
        score,
      };
    });

    const total = rankedStudents.sort((a, b) => b.score - a.score);

    res
      .status(200)
      .json({ success: true, data: { mathRank, portRank, total } });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error(User rank).", error: error.message });
  }
};

module.exports = { test, rankSchool, rankUser };
