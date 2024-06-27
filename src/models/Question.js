const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  topic: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: [true, "Question is required!"],
  },
  type: {
    type: String,
    require: [true, "Type is required!"],
    enum: ["multiple", "correct"],
    default: "multiple",
  },
  list: {
    type: Array,
    require: () => {
      return this.type === "multiple";
    },
  },
  subject: {
    // type: String,
    // required: true,
    type: Schema.Types.ObjectId,
    ref: "subjects",
  },
  level: {
    type: String,
    // enum: ["beginner", "intermediate", "advanced"],
    // default: "beginner",
    enum: ["Iniciante", "Intermediário", "Avançado"],
    default: "Iniciante",
  },
  questionDate: {
    type: Date,
    default: Date.now,
  },
  answers: [
    {
      type: Schema.Types.ObjectId,
      ref: "answers",
    },
  ],
});

module.exports = Question = mongoose.model("questions", QuestionSchema);
