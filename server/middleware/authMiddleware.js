const { getAuth, clerkClient } = require("@clerk/express");
const User = require("../models/user.js");
const {
    normalizeUsername,
    validateUsername,
    usernameCandidates
} = require("../lib/username.js");

function profileName(clerkUser, email) {
    const metadataName = clerkUser.unsafeMetadata?.collabryName;
    const name = typeof metadataName === "string" ? metadataName.trim() : "";
    const fullName = String(clerkUser.fullName ?? "").trim();

    return name || fullName || email.split("@")[0];
}

async function linkExistingProfile(profile, clerkUserId) {
    if (profile.clerkUserId && profile.clerkUserId !== clerkUserId) {
        return null;
    }

    if (profile.clerkUserId === clerkUserId) {
        return profile;
    }

    const linkedProfile = await User.findOneAndUpdate(
        {
            _id: profile._id,
            $or: [
                { clerkUserId: { $exists: false } },
                { clerkUserId: null }
            ]
        },
        { $set: { clerkUserId } },
        { new: true, runValidators: true }
    );

    return linkedProfile || User.findOne({ clerkUserId });
}

async function findProfilesByEmail(email) {
    return User.find({ email })
        .collation({ locale: "en", strength: 2 })
        .limit(2);
}

async function assignUsername(profile, preferredUsername) {
    if (profile.username) {
        return profile;
    }

    const baseName = preferredUsername || profile.name || profile.email.split("@")[0];

    for (const username of usernameCandidates(baseName)) {
        try {
            const updatedProfile = await User.findOneAndUpdate(
                {
                    _id: profile._id,
                    $or: [
                        { username: { $exists: false } },
                        { username: null },
                        { username: "" }
                    ]
                },
                { $set: { username } },
                { new: true, runValidators: true }
            );

            if (updatedProfile) {
                return updatedProfile;
            }

            const currentProfile = await User.findById(profile._id);
            if (currentProfile?.username && !validateUsername(currentProfile.username)) {
                return currentProfile;
            }
        } catch (error) {
            if (error.code !== 11000 || !error.keyPattern?.username) {
                throw error;
            }
        }
    }

    throw new Error(`Unable to generate a unique username for profile ${profile._id}`);
}

async function createProfile(clerkUser, email) {
    const profile = await User.findOneAndUpdate(
        { clerkUserId: clerkUser.id },
        {
            $setOnInsert: {
                clerkUserId: clerkUser.id,
                email,
                name: profileName(clerkUser, email)
            }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return assignUsername(profile, clerkUser.unsafeMetadata?.collabryUsername);
}

async function findOrCreateProfile(clerkUserId) {
    const linkedProfile = await User.findOne({ clerkUserId });

    if (linkedProfile) {
        return { profile: await assignUsername(linkedProfile) };
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.emailAddresses.find(
        (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail || primaryEmail.verification?.status !== "verified") {
        return { status: 403, message: "A verified primary email address is required." };
    }

    const email = primaryEmail.emailAddress.trim().toLowerCase();
    const emailProfiles = await findProfilesByEmail(email);

    if (emailProfiles.length > 1) {
        return {
            status: 403,
            message: "Multiple existing profiles match this email. Contact support to link the correct one."
        };
    }

    if (emailProfiles.length === 1) {
        const profile = await linkExistingProfile(emailProfiles[0], clerkUserId);

        if (!profile) {
            return {
                status: 403,
                message: "This email is already linked to another authentication account."
            };
        }

        return {
            profile: await assignUsername(
                profile,
                clerkUser.unsafeMetadata?.collabryUsername
            )
        };
    }

    try {
        const profile = await createProfile(clerkUser, email);
        return { profile };
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }

        const profile = await User.findOne({ clerkUserId });

        if (profile) {
            return { profile: await assignUsername(profile) };
        }

        const emailProfiles = await findProfilesByEmail(email);

        if (emailProfiles.length > 1) {
            return {
                status: 403,
                message: "Multiple existing profiles match this email. Contact support to link the correct one."
            };
        }

        if (emailProfiles.length === 1) {
            const linked = await linkExistingProfile(emailProfiles[0], clerkUserId);

            if (linked) {
                return {
                    profile: await assignUsername(
                        linked,
                        clerkUser.unsafeMetadata?.collabryUsername
                    )
                };
            }

            return {
                status: 403,
                message: "This email is already linked to another authentication account."
            };
        }

        throw error;
    }
}

const authMiddleware = async (req, res, next) => {
    const auth = getAuth(req);

    if (!auth.isAuthenticated || !auth.userId) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const result = await findOrCreateProfile(auth.userId);

        if (result.status) {
            return res.status(result.status).json({ message: result.message });
        }

        req.user = {
            userId: result.profile._id.toString()
        };

        return next();
    } catch (error) {
        if (error.status === 404) {
            return res.status(401).json({ message: "The authenticated account no longer exists." });
        }

        console.error("Failed to load the authenticated Collabry profile:", error);
        return res.status(500).json({ message: "Unable to load your Collabry profile." });
    }
};

module.exports = authMiddleware;
