const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const songModel = require("../src/models/song.model");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SONGS_TO_SEED = [
  {
    title: "Sunbeam Sprint",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Sunbeam+Sprint",
  },
  {
    title: "Confetti Avenue",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Confetti+Avenue",
  },
  {
    title: "Weekend Spark",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Weekend+Spark",
  },
  {
    title: "Bright Side Bounce",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Bright+Side+Bounce",
  },
  {
    title: "Peach Sky Pop",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Peach+Sky+Pop",
  },
  {
    title: "Smile Loop",
    artist: "Moodify Sample",
    mood: "happy",
    songUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Smile+Loop",
  },
  {
    title: "Rainy Window Letters",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Rainy+Window+Letters",
  },
  {
    title: "Midnight Echoes",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Midnight+Echoes",
  },
  {
    title: "Slow Street Lights",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Slow+Street+Lights",
  },
  {
    title: "Blue Room Rewind",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Blue+Room+Rewind",
  },
  {
    title: "Faded Polaroid",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Faded+Polaroid",
  },
  {
    title: "Quiet Goodbye",
    artist: "Moodify Sample",
    mood: "sad",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Quiet+Goodbye",
  },
  {
    title: "Soft Horizon",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Soft+Horizon",
  },
  {
    title: "Ocean Notebook",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Ocean+Notebook",
  },
  {
    title: "Evening Tea",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Evening+Tea",
  },
  {
    title: "Breathing Space",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Breathing+Space",
  },
  {
    title: "Drift in Silence",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Sample-OGG-File.ogg",
    posterUrl: "https://placehold.co/600x600/png?text=Drift+in+Silence",
  },
  {
    title: "Dawn Balcony",
    artist: "Moodify Sample",
    mood: "neutral",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Dawn+Balcony",
  },
  {
    title: "Neon Run",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Neon+Run",
  },
  {
    title: "Turbo Pulse",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Turbo+Pulse",
  },
  {
    title: "Adrenaline Code",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Adrenaline+Code",
  },
  {
    title: "Voltage Rush",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Voltage+Rush",
  },
  {
    title: "Skyline Sprint",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Skyline+Sprint",
  },
  {
    title: "Wildfire Mode",
    artist: "Moodify Sample",
    mood: "shock",
    songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
    posterUrl: "https://placehold.co/600x600/png?text=Wildfire+Mode",
  },
];

async function seedSongs() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in Backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const bulkOperations = SONGS_TO_SEED.map((song) => ({
    updateOne: {
      filter: {
        title: song.title,
        artist: song.artist,
        mood: song.mood,
      },
      update: {
        $set: song,
      },
      upsert: true,
    },
  }));

  const result = await songModel.bulkWrite(bulkOperations, { ordered: false });

  const upsertedCount = result?.upsertedCount || 0;
  const modifiedCount = result?.modifiedCount || 0;
  const matchedCount = result?.matchedCount || 0;
  const totalInCollection = await songModel.countDocuments();

  console.log("Song seed completed.");
  console.log(`Prepared records: ${SONGS_TO_SEED.length}`);
  console.log(`Inserted new records: ${upsertedCount}`);
  console.log(`Updated existing records: ${modifiedCount}`);
  console.log(`Matched existing records: ${matchedCount}`);
  console.log(`Total songs in collection now: ${totalInCollection}`);
}

seedSongs()
  .catch((error) => {
    console.error("Song seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
