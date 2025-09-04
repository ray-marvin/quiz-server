const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { startGame } = require("../controllers/gameController");

const router = express.Router();

router.post("/start", authMiddleware, startGame);

module.exports = router;
