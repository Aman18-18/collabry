const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "removed"],
        default: "pending"
    },

    // false when a decision was made that the applicant hasn't looked at yet
    decisionSeen: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;