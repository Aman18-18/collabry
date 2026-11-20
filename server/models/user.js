const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    // Stored lowercase; sparse keeps existing accounts without a username valid.
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    clerkUserId: {
        type: String,
        unique: true,
        sparse: true
    },

    password: {
        type: String,
        select: false
    },

    college: {
        type: String
    },

    branch: {
        type: String
    },

    year: {
        type: Number
    },

    skills: {
        type: [String]
    },

    bio: {
        type: String
    },

    profilePhoto: {
        type: String,
        default: ""
    },

    github: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
