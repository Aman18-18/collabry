const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { clerkMiddleware } = require("@clerk/express");

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const applicationRoutes = require("./routes/applicationRoutes");

const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Render sits in front of the app; this makes req.ip the real visitor
app.set("trust proxy", 1);

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Collabry API is running");
});

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
    if (!process.env.CLERK_SECRET_KEY) {
        throw new Error("CLERK_SECRET_KEY must be configured in server/.env");
    }

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();