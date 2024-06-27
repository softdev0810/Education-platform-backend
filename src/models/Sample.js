const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    level: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 }
});

// Question Schema
const QuestionSchema = new Schema({
    subject: { type: String, required: true },
    content: { type: String, required: true },
    level: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answers: [{
        student: { type: Schema.Types.ObjectId, ref: 'User' },
        answer: { type: String, required: true },
        isCorrect: { type: Boolean, default: false }
    }]
});

// School Schema
const SchoolSchema = new Schema({
    name: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    correctStudents: { type: Number, default: 0 }
});

// Models
const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', QuestionSchema);
const School = mongoose.model('School', SchoolSchema);
