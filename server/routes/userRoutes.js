const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Project = require("../models/project.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

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
