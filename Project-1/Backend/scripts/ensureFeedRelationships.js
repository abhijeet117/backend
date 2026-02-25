require("dotenv").config();
const mongoose = require("mongoose");

const userModel = require("../src/models/user.model");
const followerModel = require("../src/models/follower.model");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleUnique(items, count, exclude) {
  const pool = items.filter((item) => item !== exclude);
  const used = new Set();
  const result = [];

  while (result.length < count && result.length < pool.length) {
    const picked = pool[randomInt(0, pool.length - 1)];
    if (!used.has(picked)) {
      used.add(picked);
      result.push(picked);
    }
  }

  return result;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const users = await userModel.find({}).select("userName");
  const allUserNames = users.map((user) => user.userName).filter(Boolean);

  const followingAgg = await followerModel.aggregate([
    { $group: { _id: "$follower", count: { $sum: 1 } } },
  ]);
  const followingCountByUser = new Map(followingAgg.map((row) => [row._id, row.count]));

  const usersWithNoFollowing = allUserNames.filter((userName) => !followingCountByUser.has(userName));
  const rowsToInsert = [];
  const pairSet = new Set();

  for (const userName of usersWithNoFollowing) {
    const followCount = randomInt(8, 12);
    const followees = sampleUnique(allUserNames, followCount, userName);

    for (const followee of followees) {
      const pair = `${userName}::${followee}`;
      if (pairSet.has(pair)) {
        continue;
      }
      pairSet.add(pair);
      rowsToInsert.push({
        follower: userName,
        followee,
      });
    }
  }

  if (rowsToInsert.length) {
    await followerModel.insertMany(rowsToInsert, { ordered: false });
  }

  console.log(`Users with no following before fix: ${usersWithNoFollowing.length}`);
  console.log(`New follow relationships inserted: ${rowsToInsert.length}`);
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Failed to ensure feed relationships:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  });
