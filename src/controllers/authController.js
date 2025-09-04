const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    console.info("User registered and stored in db");
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Signup failed:", error.message);
    res.status(400).json({ message: "Signup failed:", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error("Login failed due to missing username or password");
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.error("Invalid credentials");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    console.info("User logged in and token generated");
    res.json({ message: "Login successful", token });

  } catch (error) {
    console.error("Login failed:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
