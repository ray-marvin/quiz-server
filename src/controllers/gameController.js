const GameSession = require("../models/GameSession");

// Queue to hold players waiting for a match
const waitingQueue = [];

exports.startGame = async (req, res) => {
  const playerId = req.user.id;

  // Check if player is already in the queue
  if (waitingQueue.includes(playerId)) {
    console.info("Player already in queue");
    return res.status(200).json({ message: "Waiting for opponent" });
  }

  // Add player to the queue
  waitingQueue.push(playerId);

  // If we have at least two players, match them
  if (waitingQueue.length >= 2) {
    const [p1, p2] = waitingQueue.splice(0, 2); // Remove first two players

    const game = new GameSession({
      players: [p1, p2],
      status: "active",
    });

    try {
      console.info("Creating game session for 2 players");
      await game.save();
      console.info("Game session created with ID:", game._id);
    } catch (error) {
      console.error("Error creating game session:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Respond to players who got matched
    if (playerId === p1 || playerId === p2) {
      return res.status(200).json({ gameId: game._id, status: "matched" });
    }
  }

  return res.status(200).json({ message: "Waiting for opponent" });
};
