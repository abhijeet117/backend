const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const songModel = require("../src/models/song.model");
const userModel = require("../src/models/user.model");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function migrateSongMoods() {
  const songUpdates = await Promise.all([
    songModel.updateMany({ mood: "calm" }, { $set: { mood: "neutral" } }),
    songModel.updateMany({ mood: "energetic" }, { $set: { mood: "shock" } }),
    songModel.updateMany({ mood: "melancholy" }, { $set: { mood: "sad" } }),
  ]);

  return songUpdates.reduce((total, result) => total + (result?.modifiedCount || 0), 0);
}

async function migrateUserExpressionHistory() {
  const result = await userModel.updateMany(
    {},
    [
      {
        $set: {
          expressionHistory: {
            $map: {
              input: "$expressionHistory",
              as: "entry",
              in: {
                $mergeObjects: [
                  "$$entry",
                  {
                    mood: {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$$entry.mood", "Calm"] }, then: "Neutral" },
                          { case: { $eq: ["$$entry.mood", "Energetic"] }, then: "Shock" },
                          { case: { $eq: ["$$entry.mood", "Melancholy"] }, then: "Sad" },
                        ],
                        default: "$$entry.mood",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]
  );

  return result?.modifiedCount || 0;
}

async function runMigration() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in Backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [songModified, userModified] = await Promise.all([migrateSongMoods(), migrateUserExpressionHistory()]);

  console.log("Mood migration completed.");
  console.log(`Songs updated: ${songModified}`);
  console.log(`Users updated: ${userModified}`);
}

runMigration()
  .catch((error) => {
    console.error("Mood migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
