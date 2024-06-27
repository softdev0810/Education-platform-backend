const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: [true, "Email already exist."],
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  avatar: {
    type: String,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: "schools",
    required: () => {
      return this.role === "student";
    },
  },
  level: {
    type: String,
    // enum: ["beginner", "intermediate", "advanced"],
    // required: () => {
    //   return this.role === "student";
    // },
    enum: ["Iniciante", "Intermediário", "Avançado"],
    required: () => {
      return this.role === "student";
    },
  },
  userAnswers: [
    {
      subject: {
        type: Schema.Types.ObjectId,
        ref: "subjects",
      },
      correctQuestions: [
        {
          question: {
            type: Schema.Types.ObjectId,
            ref: "questions",
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      answerQuestions: [
        {
          question: {
            type: Schema.Types.ObjectId,
            ref: "questions",
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student",
  },
  notify: [
    {
      type: Schema.Types.ObjectId,
      ref: "notifys",
      required: () => {
        return this.role === "student";
      },
    },
  ],
  active: {
    type: Number,
    default: 0,
  },
  visitTime: [
    {
      login: {
        type: Date,
      },
      logout: {
        type: Date,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const passwordGenSalt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, passwordGenSalt);
  }
  next();
});

module.exports = User = mongoose.model("users", UserSchema);
