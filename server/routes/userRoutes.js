const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const Project = require("../models/project.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const { normalizeUsername, validateUsername } = require("../lib/username.js");

const router = express.Router();
const PROFILE_PHOTO_MAX_BYTES = 1024 * 1024;

// accepts an array or a comma separated string
const toList = (value) => {
    const list = Array.isArray(value) ? value : String(value ?? "").split(",");
    return list.map((item) => String(item).trim()).filter(Boolean);
};

function validateProfilePhoto(value) {
    if (value === "") return null;

    if (typeof value !== "string") {
        return "Choose a valid image file";
    }

    const match = value.match(/^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/);

    if (!match) {
        return "Profile photos must be JPG, PNG, WebP, or GIF images";
    }

    const image = Buffer.from(match[2], "base64");

    if (image.length > PROFILE_PHOTO_MAX_BYTES) {
        return "Profile photos must be 1 MB or smaller";
    }

    const signatures = {
        jpeg: image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff,
        png: image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        webp: image.length >= 12 &&
            image.toString("ascii", 0, 4) === "RIFF" &&
            image.toString("ascii", 8, 12) === "WEBP",
        gif: image.length >= 6 &&
            ["GIF87a", "GIF89a"].includes(image.toString("ascii", 0, 6))
    };

    if (!signatures[match[1]]) {
        return "The selected file is not a valid image";
    }

    return null;
}

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password -clerkUserId");

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
        const {
            name,
            username: requestedUsername,
            college,
            branch,
            year,
            skills,
            bio,
            github,
            profilePhoto
        } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }
            updates.name = String(name).trim();
        }

        if (requestedUsername !== undefined) {
            const username = normalizeUsername(requestedUsername);
            const usernameError = validateUsername(username);

            if (usernameError) {
                return res.status(400).json({ message: usernameError });
            }

            const existingUsername = await User.findOne({
                username,
                _id: { $ne: req.user.userId }
            });

            if (existingUsername) {
                return res.status(409).json({
                    message: "That username is already taken"
                });
            }

            updates.username = username;
        }

        if (college !== undefined) updates.college = String(college).trim();
        if (branch !== undefined) updates.branch = String(branch).trim();
        if (bio !== undefined) updates.bio = String(bio).trim();
        if (github !== undefined) updates.github = String(github).trim();
        if (skills !== undefined) updates.skills = toList(skills);

        if (profilePhoto !== undefined) {
            const photoError = validateProfilePhoto(profilePhoto);

            if (photoError) {
                return res.status(400).json({ message: photoError });
            }

            updates.profilePhoto = profilePhoto;
        }

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
        ).select("-password -clerkUserId");

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(409).json({
                message: "That username is already taken"
            });
        }

        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/search", authMiddleware, async (req, res) => {
    try {
        const username = String(req.query.username ?? "")
            .trim()
            .replace(/^@/, "")
            .toLowerCase();

        if (username.length < 2 || username.length > 20 || !/^[a-z0-9_]+$/.test(username)) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: `^${username}` }
        })
            .select("name username")
            .sort({ username: 1 })
            .limit(20);

        res.json(users);
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
            .select("name username college branch year skills bio github profilePhoto");

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
