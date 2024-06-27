const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
  subjectName: {
    type: String,
    required: [true, "Subject is required!"],
    unique: [true, "Subject already exists."],
  },
  topic: [
    {
      type: String,
      required: [true, "Topic is required!"],
      // unique: [true, "Topic already exists."],
    },
  ],
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "questions",
    },
  ],
});

// module.exports = Subject = mongoose.model("subjects", SubjectSchema);
const Subject = mongoose.model("subjects", SubjectSchema);

// Add initial subjects
const initialSubjects = [
  // { subjectName: "Mathematics", topic: [], questions: [] },
  // { subjectName: "Portuguese", topic: [], questions: [] },
  { subjectName: "Matemática", topic: [], questions: [] },
  { subjectName: "Português", topic: [], questions: [] },
];

// Insert the initial subjects into the "subjects" collection
Subject.insertMany(initialSubjects)
  .then(() => {
    console.log("Initial subjects added successfully!");
  })
  .catch((error) => {
    console.error("Error adding initial subjects:", error);
  });

module.exports = Subject;
