const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { randomUUID } = require("crypto");
const { spawn } = require("child_process");

const TARGET_AUDIO_FORMAT = "mp3";
const TARGET_AUDIO_MIME = "audio/mpeg";
const TARGET_AUDIO_BITRATE_KBPS = Number(process.env.TARGET_AUDIO_BITRATE_KBPS || 128);

function getInputExtension(file) {
  const fromName = path.extname(file?.originalname || "").toLowerCase();
  if (fromName) {
    return fromName;
  }

  const mimeType = typeof file?.mimetype === "string" ? file.mimetype.toLowerCase() : "";
  if (mimeType.includes("mpeg")) {
    return ".mp3";
  }

  if (mimeType.includes("wav")) {
    return ".wav";
  }

  if (mimeType.includes("aac")) {
    return ".aac";
  }

  if (mimeType.includes("mp4")) {
    return ".m4a";
  }

  return ".audio";
}

function buildOptimizedFileName(originalName) {
  const baseName = path.parse(originalName || `track-${Date.now()}`).name || "track";
  return `${baseName}-optimized.${TARGET_AUDIO_FORMAT}`;
}

function runFfmpegTranscode(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-vn",
        "-map_metadata",
        "-1",
        "-acodec",
        "libmp3lame",
        "-b:a",
        `${TARGET_AUDIO_BITRATE_KBPS}k`,
        "-ac",
        "2",
        "-ar",
        "44100",
        outputPath,
      ],
      {
        shell: false,
        stdio: ["ignore", "ignore", "pipe"],
      }
    );

    let stderr = "";

    ffmpeg.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error) => {
      reject(new Error(`ffmpeg execution failed: ${error.message}`));
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed with exit code ${code}. ${stderr.trim()}`));
        return;
      }

      resolve();
    });
  });
}

async function optimizeAudioFile(file) {
  if (!Buffer.isBuffer(file?.buffer) || file.buffer.length === 0) {
    return {
      file,
      optimized: false,
      audioFormat: "",
      audioBitrateKbps: null,
      originalBytes: 0,
      optimizedBytes: 0,
    };
  }

  const originalBytes = file.buffer.length;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "moodify-audio-"));
  const inputPath = path.join(tempDir, `input-${randomUUID()}${getInputExtension(file)}`);
  const outputPath = path.join(tempDir, `output-${randomUUID()}.${TARGET_AUDIO_FORMAT}`);

  try {
    await fs.writeFile(inputPath, file.buffer);
    await runFfmpegTranscode(inputPath, outputPath);

    const optimizedBuffer = await fs.readFile(outputPath);
    if (!Buffer.isBuffer(optimizedBuffer) || optimizedBuffer.length === 0) {
      throw new Error("Optimized audio buffer is empty.");
    }

    return {
      file: {
        ...file,
        buffer: optimizedBuffer,
        originalname: buildOptimizedFileName(file.originalname),
        mimetype: TARGET_AUDIO_MIME,
      },
      optimized: optimizedBuffer.length < originalBytes,
      audioFormat: TARGET_AUDIO_FORMAT,
      audioBitrateKbps: TARGET_AUDIO_BITRATE_KBPS,
      originalBytes,
      optimizedBytes: optimizedBuffer.length,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = {
  optimizeAudioFile,
  TARGET_AUDIO_BITRATE_KBPS,
  TARGET_AUDIO_FORMAT,
  TARGET_AUDIO_MIME,
};
