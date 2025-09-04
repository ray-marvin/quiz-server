require("dotenv").config();
const mongoose = require("mongoose");

const Question = require("../models/Question");

const questions = [
  {
    text: "What is the capital of France?",
    choices: ["Berlin", "Paris", "Madrid", "Rome"],
    correctAnswer: 2,
  },
  {
    text: "Which planet is known as the Red Planet?",
    choices: ["Earth", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 2,
  },
  {
    text: 'Who wrote "Hamlet"?',
    choices: [
      "Charles Dickens",
      "William Shakespeare",
      "Leo Tolstoy",
      "Mark Twain",
    ],
    correctAnswer: 2,
  },
  {
    text: "What is the boiling point of water?",
    choices: ["90°C", "100°C", "110°C", "120°C"],
    correctAnswer: 2,
  },
  {
    text: "Which element has the chemical symbol O?",
    choices: ["Osmium", "Oxygen", "Gold", "Iron"],
    correctAnswer: 2,
  },
  {
    text: "What is the largest mammal?",
    choices: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 2,
  },
];

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    await Question.deleteMany({}); // Clear existing questions
    await Question.insertMany(questions); // Insert new questions
    console.log("Questions populated in the database successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
  });
