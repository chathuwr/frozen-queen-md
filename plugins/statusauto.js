const { cmd } = require("../command");
const TikTokScraper = require("@mtatko/tiktok-scraper");

// Global variables to store settings
const tiktokSettings = {
  links: [],
  autoStatus: new Map(), // Store autoStatus for each group
  interval: 300000, // Default: 5 minutes
};

cmd(
  {
    pattern: "addlink",
    react: "🔗",
    desc: "Add TikTok links (Owner Only)",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, isOwner, reply, text }) => {
    try {
      if (!isOwner) return reply("❌ This command can only be used by the owner!");

      // Check if links are provided
      if (!text) return reply("❌ Please provide TikTok links! Example: .addlink https://vt.tiktok.com/ZSMnrHaKd/");

      // Extract links from the message
      const newLinks = text.split(" ").filter(link => link.startsWith("https://"));

      if (newLinks.length === 0) return reply("❌ No valid TikTok links found!");

      // Add new links to the global list
      tiktokSettings.links.push(...newLinks);
      reply(`✅ Added ${newLinks.length} links. Total links: ${tiktokSettings.links.length}`);
    } catch (e) {
      console.error("Error in addlink command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

cmd(
  {
    pattern: "settime",
    react: "⏰",
    desc: "Set the interval for auto-sending videos (in minutes)",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, isOwner, reply, text }) => {
    try {
      if (!isOwner) return reply("❌ This command can only be used by the owner!");

      // Check if time is provided
      if (!text) return reply("❌ Please provide a time in minutes! Example: .settime 5");

      const time = parseInt(text);
      if (isNaN(time) || time <= 0) return reply("❌ Please provide a valid time in minutes! Example: .settime 5");

      // Convert minutes to milliseconds
      tiktokSettings.interval = time * 60000;
      reply(`✅ Auto-send interval set to ${time} minutes`);
    } catch (e) {
      console.error("Error in settime command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

cmd(
  {
    pattern: "autostatus",
    react: "🤖",
    desc: "Enable/disable auto-sending TikTok videos to the group",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, isGroup, reply }) => {
    try {
      if (!isGroup) return reply("❌ This command can only be used in a group!");

      // Toggle autoStatus for this group
      const currentStatus = tiktokSettings.autoStatus.get(from) || false;
      tiktokSettings.autoStatus.set(from, !currentStatus);
      reply(`✅ AutoStatus is now ${!currentStatus ? "ON" : "OFF"}`);

      if (!currentStatus) {
        // Start sending videos for this group
        sendTikTokVideos(robin, from, reply);
      }
    } catch (e) {
      console.error("Error in autostatus command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

// Function to send TikTok videos
const sendTikTokVideos = async (robin, from, reply) => {
  try {
    const isAutoStatusOn = tiktokSettings.autoStatus.get(from);
    if (!isAutoStatusOn || tiktokSettings.links.length === 0) {
      tiktokSettings.autoStatus.set(from, false); // Turn off autoStatus if no links are left
      return reply("❌ No more links to send. AutoStatus turned OFF.");
    }

    const link = tiktokSettings.links.shift(); // Get the first link and remove it from the list
    const fetch = (await import('node-fetch')).default;
    const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(link)}`;
    const response = await fetch(API_URL);

    if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);
    const result = await response.json();
    if (result.code !== 0 || !result.data || !result.data.play) {
      reply(`❌ Couldn't fetch video from link: ${link}`);
      return;
    }

    const videoUrl = result.data.play;
    const caption = `🎥 *Frozen Queen Status*`; // Only this caption

    await robin.sendMessage(from, { video: { url: videoUrl }, caption, mimetype: "video/mp4" });

    // Schedule the next video
    setTimeout(() => sendTikTokVideos(robin, from, reply), tiktokSettings.interval);
  } catch (e) {
    console.error("Error in sendTikTokVideos:", e);
    reply(`❌ Error: ${e.message}`);
  }
};
