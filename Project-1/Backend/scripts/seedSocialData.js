require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = require("../src/models/user.model");
const postModel = require("../src/models/post.model");
const likeModel = require("../src/models/likes.model");
const followerModel = require("../src/models/follower.model");

const profileImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80",
];

const postImages = [
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
];

const captions = [
  "Weekend frame dump.",
  "Sunlight and simple details.",
  "Shot this on my morning walk.",
  "Clean setup for focused work.",
  "Street style mood for today.",
  "Meal was better than expected.",
  "Trying to stay consistent.",
  "Little moments, big energy.",
  "New upload from tonight.",
  "Keeping things minimal lately.",
];

const commentTemplates = [
  "This looks amazing.",
  "Great shot.",
  "Love this vibe.",
  "Insane details.",
  "Saving this for later.",
  "Clean composition.",
  "Absolute banger post.",
];

const firstNames = [
  "Rahul", "Aarav", "Vihaan", "Kabir", "Anika", "Isha", "Meera", "Riya", "Neha", "Sara",
  "Arjun", "Rohan", "Karan", "Nisha", "Maya", "Tara", "Ibrahim", "Zara", "Aisha", "Dev",
  "Rehan", "Pooja", "Vikram", "Sana", "Priya", "Yash", "Kavya", "Aditya", "Simran", "Nikhil",
];

const lastNames = [
  "Sharma", "Mehta", "Kapoor", "Verma", "Malhotra", "Joshi", "Singh", "Patel", "Khan", "Ali",
  "Iyer", "Gupta", "Rao", "Bose", "Das", "Arora", "Saxena", "Sethi", "Nair", "Chopra",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function makeUsername(firstName, lastName, index) {
  return `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${index}`;
}

function makeEmail(userName) {
  return `${userName}@socialseed.dev`;
}

function sampleUnique(items, count, exclude) {
  const pool = items.filter((item) => item !== exclude);
  const result = [];
  const used = new Set();

  while (result.length < count && result.length < pool.length) {
    const value = pool[randomInt(0, pool.length - 1)];
    if (!used.has(value)) {
      used.add(value);
      result.push(value);
    }
  }

  return result;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingUsers = await userModel.find({}).select("userName email");
  const usedUserNames = new Set(existingUsers.map((u) => u.userName));
  const usedEmails = new Set(existingUsers.map((u) => u.email));

  const usersToCreate = [];
  let sequence = Date.now();

  while (usersToCreate.length < 50) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const userName = makeUsername(firstName, lastName, sequence);
    const email = makeEmail(userName);
    sequence += 1;

    if (usedUserNames.has(userName) || usedEmails.has(email)) {
      continue;
    }

    usedUserNames.add(userName);
    usedEmails.add(email);

    const plainPassword = `Test@${randomInt(100000, 999999)}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    usersToCreate.push({
      userName,
      email,
      plainPassword,
      password: hashedPassword,
      profileImg: pick(profileImages),
      bio: `Hi, I am ${firstName}. Sharing moments from life.`,
    });
  }

  const createdUsers = await userModel.insertMany(
    usersToCreate.map((user) => ({
      userName: user.userName,
      email: user.email,
      password: user.password,
      profileImg: user.profileImg,
      bio: user.bio,
    })),
  );

  const seededUserNames = createdUsers.map((user) => user.userName);
  const seededUserByName = new Map(createdUsers.map((user) => [user.userName, user]));

  const followRows = [];
  const followPairs = new Set();

  for (const user of createdUsers) {
    const followCount = randomInt(8, 16);
    const followees = sampleUnique(seededUserNames, followCount, user.userName);
    for (const followee of followees) {
      const pair = `${user.userName}::${followee}`;
      if (followPairs.has(pair)) {
        continue;
      }
      followPairs.add(pair);
      followRows.push({
        follower: user.userName,
        followee,
      });
    }
  }

  if (followRows.length) {
    await followerModel.insertMany(followRows, { ordered: false });
  }

  const postsToCreate = [];
  for (const user of createdUsers) {
    const postCount = randomInt(2, 3);
    for (let i = 0; i < postCount; i += 1) {
      const commentUsers = sampleUnique(seededUserNames, randomInt(1, 3), user.userName);
      postsToCreate.push({
        user: user._id,
        caption: pick(captions),
        img_url: pick(postImages),
        comments: commentUsers.map((commentUserName) => ({
          userName: commentUserName,
          text: pick(commentTemplates),
        })),
      });
    }
  }

  const createdPosts = await postModel.insertMany(postsToCreate);

  const likeRows = [];
  const likePairs = new Set();
  for (const post of createdPosts) {
    const postOwner = [...seededUserByName.values()].find((u) => u._id.toString() === post.user.toString());
    const likerCount = randomInt(6, 20);
    const likerUserNames = sampleUnique(seededUserNames, likerCount, postOwner?.userName);

    for (const likerUserName of likerUserNames) {
      const pair = `${post._id.toString()}::${likerUserName}`;
      if (likePairs.has(pair)) {
        continue;
      }
      likePairs.add(pair);
      likeRows.push({
        post: post._id,
        user: likerUserName,
      });
    }
  }

  if (likeRows.length) {
    await likeModel.insertMany(likeRows, { ordered: false });
  }

  const persistedUsers = await userModel
    .find({ _id: { $in: createdUsers.map((user) => user._id) } })
    .select("_id userName email profileImg +password");
  const persistedUsersByName = new Map(persistedUsers.map((user) => [user.userName, user]));

  const report = createdUsers.map((user) => {
    const source = usersToCreate.find((row) => row.userName === user.userName);
    const persisted = persistedUsersByName.get(user.userName);
    return {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      plainPassword: source.plainPassword,
      hashedPasswordInDb: persisted?.password || "",
      profileImg: user.profileImg,
    };
  });

  const outputDir = path.join(__dirname, "output");
  fs.mkdirSync(outputDir, { recursive: true });
  const reportPath = path.join(outputDir, "seed-users-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Inserted users: ${createdUsers.length}`);
  console.log(`Inserted follows: ${followRows.length}`);
  console.log(`Inserted posts: ${createdPosts.length}`);
  console.log(`Inserted likes: ${likeRows.length}`);
  console.log(`User credentials report: ${reportPath}`);
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
