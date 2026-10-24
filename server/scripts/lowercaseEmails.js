// One-time fix: makes every stored email lowercase and trimmed.
// Run from the server folder:  node scripts/lowercaseEmails.js
// It reads the same .env and database connection as the server itself.
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.js");

async function run() {
    await connectDB();

    const users = await User.find({}).select("email");

    let changed = 0;
    const clashes = [];

    for (const user of users) {
        const clean = user.email.trim().toLowerCase();

        if (clean === user.email) continue;

        const clash = await User.findOne({
            email: clean,
            _id: { $ne: user._id }
        });

        if (clash) {
            clashes.push(`${user.email} clashes with ${clash.email}`);
            continue;
        }

        await User.updateOne({ _id: user._id }, { email: clean });
        changed++;
    }

    console.log(`Checked ${users.length} users, changed ${changed}.`);

    if (clashes.length > 0) {
        console.log("Not changed, two accounts would share one email:");
        clashes.forEach((line) => console.log("  " + line));
    }

    await mongoose.disconnect();
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
