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
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;