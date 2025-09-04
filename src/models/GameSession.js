const mongoose = require("mongoose");

const questionSchema = require("./Question").schema;

const gameSessionSchema = new mongoose.Schema({
  players: [String],
  questions: [questionSchema],
  scores: { type: Map, of: Number },
  answers: [
    {
      playerId: String,
      answer: Number,
      correct: Boolean,
    },
  ],
  progress: { type: Map, of: Number },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  winner: { type: String },
  resultType: { type: String, enum: ["win", "draw", "disconnect"] },
});

module.exports = mongoose.model("GameSession", gameSessionSchema);
