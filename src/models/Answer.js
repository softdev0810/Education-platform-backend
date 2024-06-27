const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "questions",
  },
  answer: {
    type: Array,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  answerDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Answer = mongoose.model("answers", AnswerSchema);
