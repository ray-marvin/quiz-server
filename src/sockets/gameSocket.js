const jwt = require("jsonwebtoken");

const GameSession = require("../models/GameSession");
const Question = require("../models/Question");
const User = require("../models/User");

const userSocketMap = new Map(); // userId → socket
const userGameMap = new Map(); // userId → gameId
const waitingPlayers = []; // Queue of waiting player sockets

module.exports = function initializeSocket(io) {
  // Middle ware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.query?.token;

    if (!token) {
      console.error("No token provided");
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Invalid token", err.message);
      next(new Error("Invalid token"));
    }
  });

  // Handling new socket connections
  io.on("connection", async (socket) => {
    const userId = socket.userId;
    console.log("Socket connected:", userId);
    userSocketMap.set(userId, socket);

    // Check if player socket is already in a queue or add to the queue if not
    const alreadyWaiting = waitingPlayers.some(
      (p) => p.userId === socket.userId
    );
    if (!alreadyWaiting) {
      waitingPlayers.push(socket);
    }

    // If there are two players in the queue, start a new game session
    if (waitingPlayers.length === 2) {
      const [p1, p2] = waitingPlayers.splice(0, 2);

      const sampleSize = await Question.countDocuments();
      const questions = await Question.aggregate([
        { $sample: { size: sampleSize } },
      ]);

      const game = new GameSession({
        players: [p1.userId, p2.userId],
        questions,
        scores: {},
        progress: {},
        status: "active",
      });

      try {
        await game.save();
        console.log("Game session created:", game._id);
      } catch (error) {
        console.error("Error creating game session:", error);
      }

      // Assigning gameId to player sockets
      p1.gameId = game._id;
      p2.gameId = game._id;

      userGameMap.set(p1.userId, game._id);
      userGameMap.set(p2.userId, game._id);

      // Initializing game for both players
      [p1, p2].forEach((p) => {
        p.gameId = game._id;
        p.emit("game:init", {
          gameId: game._id,
          players: [p1.userId, p2.userId],
        });

        // Sending the first question to both players
        p.emit("question:send", {
          index: 0,
          text: questions[0].text,
          choices: questions[0].choices,
        });

        // Handling answer submission from players
        p.on("answer:submit", async ({ answer }) => {
          const currentGame = await GameSession.findById(p.gameId);
          const userId = p.userId;

          // Tracking player progress through questions
          const questionIndex = currentGame.progress.get(userId) || 0;

          if (currentGame.status === "completed") {
            p.emit("game:end", {
              message: "Game already completed. Please start a new game",
            });
            return;
          }

          if (questionIndex >= currentGame.questions.length) {
            p.emit("game:wait", {
              message:
                "You have completed all questions. Waiting for opponent to finish",
            });
            return;
          }

          const correct =
            currentGame.questions[questionIndex].correctAnswer === answer;
          const currentScore = currentGame.scores.get(userId) || 0;

          currentGame.scores.set(userId, currentScore + (correct ? 1 : 0));
          currentGame.progress.set(userId, questionIndex + 1);
          currentGame.answers.push({
            playerId: userId,
            answer,
            correct,
          });

          try {
            await currentGame.save();
            console.log("Game session updated:", currentGame._id);
          } catch (error) {
            console.error("Error updating game session:", error);
          }

          // Send next question if available
          if (questionIndex + 1 < currentGame.questions.length) {
            const nextQ = currentGame.questions[questionIndex + 1];
            p.emit("question:send", {
              index: questionIndex + 1,
              text: nextQ.text,
              choices: nextQ.choices,
            });
          }

          // player ids
          const [p1, p2] = currentGame.players;

          const [user1, user2] = await Promise.all([
            User.findById(p1),
            User.findById(p2),
          ]);

          const p1Completed =
            (currentGame.progress.get(p1) || 0) >= currentGame.questions.length;
          const p2Completed =
            (currentGame.progress.get(p2) || 0) >= currentGame.questions.length;

          // Check if both players have completed the quiz
          if (p1Completed && p2Completed) {
            const score1 = currentGame.scores.get(p1) || 0;
            const score2 = currentGame.scores.get(p2) || 0;
            const winner = score1 > score2 ? p1 : score2 > score1 ? p2 : null;

            currentGame.status = "completed";
            currentGame.winner = winner;

            const winnerName =
              winner === p1
                ? user1?.username
                : winner === p2
                ? user2?.username
                : "none";

            console.log("Winner:", user1?.username);

            if (score1 == score2) {
              currentGame.resultType = "draw";
            } else currentGame.resultType = "win";

            try {
              await currentGame.save();
              console.log("Game session updated:", currentGame._id);
            } catch (error) {
              console.error("Error updating game session:", error);
            }

            const sockets = [userSocketMap.get(p1), userSocketMap.get(p2)];
            sockets.forEach((client) => {
              client.emit("game:end", {
                gameId: currentGame._id,
                players: [
                  {
                    id: p1,
                    name: user1?.username || "Player 1",
                    score: score1,
                  },
                  {
                    id: p2,
                    name: user2?.username || "Player 2",
                    score: score2,
                  },
                ],
                winner: winnerName,
                resultType: currentGame.resultType,
              });
            });
          }
        });
      });
    } else {
      socket.emit("game:wait", { message: "Waiting for an opponent to join" });
    }

    // Handling socket disconnect
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      const gameId = userGameMap.get(userId);

      if (!gameId) return;

      const game = await GameSession.findById(gameId);

      if (!game || game.status === "completed") {
        return;
      }

      const [p1, p2] = game.players;

      const opponentId = userId === p1 ? p2 : p1;
      const opponentSocket = userSocketMap.get(opponentId);

      const score1 = game.scores.get(p1) || 0;
      const score2 = game.scores.get(p2) || 0;

      const [user1, user2] = await Promise.all([
        User.findById(p1),
        User.findById(p2),
      ]);

      game.status = "completed";
      game.resultType = "disconnect";

      try {
        await game.save();
        console.log("Game session updated:", currentGame._id);
      } catch (error) {
        console.error("Error updating game session:", error);
      }

      if (opponentSocket) {
        opponentSocket.emit("game:end", {
          gameId: game._id,
          players: [
            { id: p1, name: user1?.username || "Player 1", score: score1 },
            { id: p2, name: user2?.username || "Player 2", score: score2 },
          ],
          reason: "Opponent disconnected",
        });
      }

      userGameMap.delete(p1);
      userGameMap.delete(p2);
    });
  });
};
