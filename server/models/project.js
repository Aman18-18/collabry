const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    techStack: {
        type: [String]
    },

    skillsNeeded: {
        type: [String]
    },

    teamSize: {
        type: Number,
        required: true
    },

    currentSize: {
        type: Number,
        default: 1
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;