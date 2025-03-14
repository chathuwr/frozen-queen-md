const { cmd } = require("../command");
const axios = require("axios"); // Install axios: npm install axios
const config = require("../config");

const API_URL = "https://api.skymansion.site/fb-dl/download";
const API_KEY = config.FB_API_KEY; // Assuming you have this in your config

cmd(
  {
    pattern: "fb",
    alias: ["facebook"],
    react: "🎬",
    category: "download",
    desc: "Download Facebook videos with quality selection",
    filename: __filename,
  },
  async (
    robin,
    m,
    mek,
    { from, q, reply }
  ) => {
    try {
      // Check if URL is provided
      if (!q || q.trim() === "") return await reply("*🎬 Please provide a valid Facebook video URL!* ❄️");

      // Validate Facebook URL
      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb|m\.facebook|fb\.watch)\.com\/.+?(videos|watch|video)\/.+/i;
      if (!fbRegex.test(q)) {
        return await reply("*❌ Invalid Facebook video URL! Please provide a valid video link (e.g., fb.watch or facebook.com/videos).* ❄️");
      }

      // Notify user of fetch start
      await reply("*⏳ Fetching video details, please wait...* ❄️");

      // API setup
      const apiUrl = `${API_URL}?url=${encodeURIComponent(q)}&api_key=${API_KEY}`;
      const response = await axios.get(apiUrl, { timeout: 15000 });

      if (!response.data || !response.data.data) {
        return await reply("*❌ Failed to fetch video details. The URL might be invalid or the API key is incorrect.* ❄️");
      }

      const videoData = response.data.data;

      // Check if multiple quality options are available
      if (Array.isArray(videoData) && videoData.length > 1) {
        // Prepare button options
        const qualityOptions = videoData.map((video, index) => ({
          buttonId: `fb_quality_${index}`,
          buttonText: { displayText: video.quality || `Option ${index + 1}` },
          type: 1,
        }));

        // Send interactive message with buttons
        const buttonMessage = {
          text: "*🎬 Facebook Video*\n\nChoose your preferred quality:",
          footer: "Powered by Frozen Queen ❄️",
          buttons: qualityOptions,
          headerType: 1,
        };

        await robin.sendMessage(from, buttonMessage, { quoted: mek });

        // Store video data temporarily
        global.tempFbVideos = global.tempFbVideos || new Map();
        global.tempFbVideos.set(m.sender, videoData);

      } else {
        // Single video option, send directly
        const video = Array.isArray(videoData) ? videoData[0] : videoData;
        await robin.sendMessage(
          from,
          {
            video: { url: video.url },
            caption: `*🎬 Facebook Video*\n📌 Quality: ${video.quality || "Default"}\n✅ Powered by ❄️ Frozen Queen ❄️`,
          },
          { quoted: mek }
        );
      }

    } catch (e) {
      if (e.code === "ECONNABORTED") {
        return await reply("*❌ Timeout: The server took too long to respond. Please try again later.* ❄️");
      } else if (e.response && e.response.status === 401) {
        return await reply("*❌ Unauthorized: Invalid API key. Please contact the bot owner.* ❄️");
      } else if (e.response && e.response.status === 404) {
        return await reply("*❌ API endpoint not found. The service might be down.* ❄️");
      } else {
        console.error("Error downloading FB video:", e);
        return await reply(`*❌ Error:* ${e.message || "Something went wrong while downloading the video. Try again later."} ❄️`);
      }
    }
  }
);

// Handle button response
cmd(
  {
    pattern: "fb_quality",
    dontAddCommandList: true, // Hide from command list
  },
  async (
    robin,
    mek,
    m,
    { from, reply }
  ) => {
    try {
      const buttonId = m.id; // Assuming the framework passes the button ID
      const index = parseInt(buttonId.split("_")[2]); // Extract index from "fb_quality_0"
      const videoData = global.tempFbVideos?.get(m.sender);

      if (!videoData || isNaN(index) || index >= videoData.length) {
        return await reply("*❌ Invalid selection or session expired. Please try again with a new URL.* ❄️");
      }

      const selectedVideo = videoData[index];
      await robin.sendMessage(
        from,
        {
          video: { url: selectedVideo.url },
          caption: `*🎬 Facebook Video*\n📌 Quality: ${selectedVideo.quality || "Selected Quality"}\n✅ Powered by ❄️ Frozen Queen ❄️`,
        },
        { quoted: mek }
      );

      // Clean up temporary storage
      global.tempFbVideos.delete(m.sender);

    } catch (e) {
      console.error("Error sending selected video:", e);
      await reply("*❌ Error sending video. Please try again.* ❄️");
    }
  }
);
