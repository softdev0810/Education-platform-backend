const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotifySchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  content: {
    type: String,
    required: [true, "Content is required."],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Notify = mongoose.model("notifys", NotifySchema);
