// Resets one user's password by hand. No email needed.
//
//   node scripts/resetPassword.js friend@example.com
//       -> makes a random temporary password and prints it
//   node scripts/resetPassword.js friend@example.com "their-own-choice"
//       -> uses the password you give (8 to 72 characters)
//   add --yes to skip the confirmation question
//
// Run it from the server folder. It uses the same .env and database as the server.
require("dotenv").config();

const crypto = require("crypto");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.js");

// no look-alike characters (0/O, 1/l/I), so it is easy to read out in a message
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makePassword(length = 12) {
    let password = "";

    for (let i = 0; i < length; i++) {
        password += ALPHABET[crypto.randomInt(ALPHABET.length)];
    }

    return password;
}

function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function run(argv) {
    const skipConfirm = argv.includes("--yes");
    const [rawEmail, chosenPassword] = argv.filter((arg) => !arg.startsWith("--"));
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email) {
        console.log('Usage: node scripts/resetPassword.js <email> ["new password"] [--yes]');
        return 1;
    }

    if (chosenPassword !== undefined &&
        (chosenPassword.length < 8 || chosenPassword.length > 72)) {
        console.log("A password must be between 8 and 72 characters.");
        return 1;
    }

    await connectDB();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`No account found for ${email}.`);
            return 1;
        }

        console.log(`Account found: ${user.name} <${user.email}>`);

        if (!skipConfirm) {
            const answer = await ask('Type "yes" to reset this password: ');

            if (answer.trim().toLowerCase() !== "yes") {
                console.log("Cancelled. Nothing was changed.");
                return 0;
            }
        }

        const password = chosenPassword || makePassword();
        const hashed = await bcrypt.hash(password, 10);

        await User.updateOne({ _id: user._id }, { password: hashed });

        console.log("");
        console.log(`Password reset for ${user.email}`);
        console.log(`New password: ${password}`);
        console.log("");
        console.log("Send it to them privately, and ask them to change it right away");
        console.log("(Profile, then Change password).");

        return 0;
    } finally {
        await mongoose.disconnect();
    }
}

module.exports = { run };

if (require.main === module) {
    run(process.argv.slice(2))
        .then((code) => process.exit(code))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
