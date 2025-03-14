const { cmd, commands } = require("../command");
const ytsr = require("youtube-sr").default;
const ytdl = require("ytdl-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Helper function to format numbers (e.g., 1000 → 1k)
function formatNumber(num) {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M"; // Convert to millions (e.g., 1.5M)
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "k"; // Convert to thousands (e.g., 1.2k)
  }
  return num.toString(); // Return as is if less than 1000
}

// YouTube Search Command
cmd(
  {
    pattern: "yts",
    alias: ["youtube", "ytsearch"],
    desc: "Search YouTube and get video results",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }
  ) => {
    try {
      let query = q || (quoted && quoted.text) || "";
      if (!query) {
        return reply("Please provide a search term! Example: .yts Learn JavaScript");
      }

      reply(`🔍 Searching YouTube for: "${query}"`);

      // Search YouTube using youtube-sr
      const searchResults = await ytsr.search(query, { limit: 10 });

      if (!searchResults || searchResults.length === 0) {
        return reply("❌ No results found for your search.");
      }

      // Format the search results
      let resultText = `*🎬 Frozen Queen YT Searcher - Results for "${query}"*\n\n`;
      
      searchResults.forEach((item, index) => {
        resultText += `*${index + 1}. ${item.title}*\n`;
        resultText += `👤 Channel: ${item.channel.name}\n`;
        resultText += `⏱️ Duration: ${item.durationFormatted || "N/A"}\n`;
        resultText += `👁️ Views: ${item.views ? formatNumber(item.views) : "N/A"}\n`;
        resultText += `🔗 Link: ${item.url}\n\n`;
      });

      resultText += `\nTo download or play a video, use the command:\n.ytdl [video number or link]`;

      // Add a custom image (e.g., "Frozen Queen YT Searcher")
      const customImageUrl = "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true"; // Replace with your image URL
      const tempDir = path.join(__dirname, "../temp");
      const imagePath = path.join(tempDir, `frozen-queen-yt-searcher_${Date.now()}.jpg`);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Download the custom image
      const response = await axios.get(customImageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      // Send the formatted results with the custom image
      await robin.sendMessage(
        from,
        {
          image: fs.readFileSync(imagePath),
          caption: resultText,
        },
        { quoted: mek }
      );

      // Clean up the image file
      fs.unlinkSync(imagePath);

    } catch (e) {
      console.error(e);
      reply(`Error performing YouTube search: ${e.message || e}`);
    }
  }
);

// YouTube Download Command
cmd(
  {
    pattern: "ytdl",
    alias: ["ytdownload", "ytmp4", "ytmp3"],
    desc: "Download YouTube video as audio/video",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }
  ) => {
    try {
      if (!q) {
        return reply("Please provide a YouTube link or result number! Example: .ytdl https://youtu.be/dQw4w9WgXcQ");
      }

      reply("⬇️ Processing your download request. Please wait...");

      let videoUrl = q;

      // Validate the YouTube URL
      if (!ytdl.validateURL(videoUrl)) {
        return reply("❌ Invalid YouTube URL provided.");
      }

      const tempDir = path.join(__dirname, "../temp");
      const outputPath = path.join(tempDir, `ytdl_${Date.now()}.mp4`);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Download the video using ytdl-core with cookies
      const cookiesFilePath = path.join(__dirname, "../cookies.txt"); // Path to your cookies file
      const cookies = fs.existsSync(cookiesFilePath) ? fs.readFileSync(cookiesFilePath, "utf8") : "";

      const videoStream = ytdl(videoUrl, {
        quality: "highest",
        filter: (format) => format.container === "mp4", // Download as MP4
        requestOptions: {
          headers: {
            Cookie: cookies, // Pass cookies here
          },
        },
      });

      const writeStream = fs.createWriteStream(outputPath);

      videoStream.pipe(writeStream);

      writeStream.on("finish", async () => {
        reply("✅ Download completed! Sending video now...");

        // Send the downloaded video
        await robin.sendMessage(
          from,
          { 
            video: fs.readFileSync(outputPath),
            caption: "Downloaded from YouTube using Frozen Queen YT Searcher",
          },
          { quoted: mek }
        );

        // Clean up temp file after sending
        fs.unlinkSync(outputPath);
      });

      writeStream.on("error", (err) => {
        console.error(err);
        reply(`Error downloading YouTube video: ${err.message || err}`);
      });

    } catch (e) {
      console.error(e);
      reply(`Error downloading YouTube video: ${e.message || e}`);
    }
  }
);
