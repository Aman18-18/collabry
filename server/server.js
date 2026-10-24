const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const applicationRoutes = require("./routes/applicationRoutes");

const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Render sits in front of the app; this makes req.ip the real visitor
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Collabry API is running");
});

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/applications", applicationRoutes);
app.use("/users", userRoutes);

app.get("/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();