const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/user.js");
const Project = require("../models/project.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// stops someone with a stolen session from guessing the current password
const changePasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => String(req.user?.userId ?? "unknown"),
    message: { message: "Too many attempts. Please wait a few minutes and try again." }
});

// accepts an array or a comma separated string
const toList = (value) => {
    const list = Array.isArray(value) ? value : String(value ?? "").split(",");
    return list.map((item) => String(item).trim()).filter(Boolean);
};

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// only these fields can be edited, so nobody can touch email or password here
router.put("/me", authMiddleware, async (req, res) => {
    try {
        const { name, college, branch, year, skills, bio, github } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }
            updates.name = String(name).trim();
        }

        if (college !== undefined) updates.college = String(college).trim();
        if (branch !== undefined) updates.branch = String(branch).trim();
        if (bio !== undefined) updates.bio = String(bio).trim();
        if (github !== undefined) updates.github = String(github).trim();
        if (skills !== undefined) updates.skills = toList(skills);

        if (year !== undefined && year !== "") {
            const yearNumber = Number(year);

            if (!Number.isInteger(yearNumber) || yearNumber < 1 || yearNumber > 6) {
                return res.status(400).json({
                    message: "Year must be a number between 1 and 6"
                });
            }
            updates.year = yearNumber;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// change your own password (needs the current one)
router.put("/me/password", authMiddleware, changePasswordLimiter, async (req, res) => {
    try {
        const currentPassword = String(req.body.currentPassword ?? "");
        const newPassword = String(req.body.newPassword ?? "");

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Fill in both passwords" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "New password must be at least 8 characters" });
        }

        if (newPassword.length > 72) {
            return res.status(400).json({ message: "New password must be 72 characters or fewer" });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // a wrong password is a 400 on purpose: a 401 would log the person out
        const matches = await bcrypt.compare(currentPassword, user.password);

        if (!matches) {
            return res.status(400).json({ message: "Your current password is wrong" });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "Choose a different password" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id: user._id }, { password: hashed });

        res.json({ message: "Password changed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// any logged-in user can read another member's public profile.
// Only this fixed list of fields is returned: no email, no password.
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await User.findById(req.params.id)
            .select("name college branch year skills bio github");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const projects = await Project.find({ owner: user._id })
            .select("title status projectType teamSize currentSize createdAt")
            .sort({ createdAt: -1 });

        res.json({ user, projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
