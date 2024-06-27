const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
  schoolName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  correctAnsNum: [
    {
      subject: {
        type: Schema.Types.ObjectId,
        ref: "subjects",
      },
      correctNum: {
        type: Number,
        default: 0,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = School = mongoose.model("schools", SchoolSchema);
