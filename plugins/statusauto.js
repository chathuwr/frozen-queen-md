const { cmd } = require("../command");
const TikTokScraper = require("@mtatko/tiktok-scraper");

// Store TikTok links, time interval, and running state globally
let tiktokLinks = [];
let timeInterval = 300000; // Default 5 minutes in milliseconds
let isAutoStatusRunning = false; // Flag to control the loop

cmd(
  {
    pattern: "addlink",
    react: "🤖",
    desc: "Add TikTok links for auto-posting (owner only)",
    category: "owner",
    filename: __filename,
  },
  async (robin, mek, m, { from, isOwner, args, reply }) => {
    try {
      if (!isOwner) return reply("❌ This command is for owner only!");
      if (!args.length) return reply("❌ Please provide at least one TikTok URL! Example: .addlink https://vt.tiktok.com/ZSMnrHaKd/");

      const rawInput = args.join(" ");
      tiktokLinks = rawInput
        .split(/\s+/)
        .flatMap(link => link.split(/(?=https:\/\/)/))
        .filter(link => link.match(/^https:\/\/(vt\.tiktok\.com|www\.tiktok\.com)\/.+/))
        .map(link => link.trim());

      if (!tiktokLinks.length) return reply("❌ No valid TikTok URLs provided! Use format: .addlink https://vt.tiktok.com/abc/");

      await reply(`✅ Added ${tiktokLinks.length} TikTok links successfully!\nCurrent links: ${tiktokLinks.join(", ")}`);
    } catch (e) {
      console.error("Error in addlink command:", e.message);
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

cmd(
  {
    pattern: "autostatus",
    react: "🤖",
    desc: "Start auto-posting TikTok videos to group",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, isGroup, reply }) => {
    try {
      if (!isGroup) return reply("❌ This command can only be used in a group!");
      if (!tiktokLinks.length) return reply("❌ No TikTok links available! Owner needs to add links using .addlink");
      if (isAutoStatusRunning) return reply("❌ Auto-status is already running! Use .autostatusoff to stop it first.");

      isAutoStatusRunning = true;
      await reply(`🤖 Starting auto TikTok posting every ${timeInterval / 60000} minutes...`);
      console.log("Current TikTok links:", tiktokLinks);

      const sendTikTokVideos = async () => {
        while (isAutoStatusRunning) {
          for (const link of tiktokLinks) {
            if (!isAutoStatusRunning) break;
            try {
              await new Promise(resolve => setTimeout(resolve, 1000)); // API rate limit delay

              const fetch = (await import("node-fetch")).default;
              const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(link)}`;
              const response = await fetch(API_URL);

              if (!response.ok) {
                console.error(`API request failed for ${link} with status: ${response.status}`);
                continue;
              }

              const result = await response.json();
              if (result.code !== 0 || !result.data || !result.data.play) {
                console.error(`Invalid API response for ${link}:`, result);
                continue;
              }

              const videoUrl = result.data.play;
              const caption = "Frozen queen status";

              await robin.sendMessage(from, {
                video: { url: videoUrl },
                caption,
                mimetype: "video/mp4",
              });

              console.log(`Successfully posted video from ${link}`);
            } catch (e) {
              console.error(`Error posting video from ${link}:`, e.message);
            }
            if (isAutoStatusRunning) {
              await new Promise(resolve => setTimeout(resolve, timeInterval));
            }
          }
        }
        console.log("Auto-status stopped.");
      };

      sendTikTokVideos();
    } catch (e) {
      console.error("Error in autostatus command:", e.message);
      await reply(`❌ Error: ${e.message}`);
      isAutoStatusRunning = false;
    }
  }
);

cmd(
  {
    pattern: "autostatusoff",
    react: "🤖",
    desc: "Stop auto-posting TikTok videos",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, isGroup, reply }) => {
    try {
      if (!isGroup) return reply("❌ This command can only be used in a group!");
      if (!isAutoStatusRunning) return reply("❌ Auto-status is not running!");

      isAutoStatusRunning = false;
      await reply("✅ Auto TikTok posting stopped!");
      console.log("Auto-status turned off by command.");
    } catch (e) {
      console.error("Error in autostatusoff command:", e.message);
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

cmd(
  {
    pattern: "settime",
    react: "🤖",
    desc: "Set time interval for auto-posting (in minutes)",
    category: "owner",
    filename: __filename,
  },
  async (robin, mek, m, { from, isOwner, args, reply }) => {
    try {
      if (!isOwner) return reply("❌ This command is for owner only!");
      if (!args[0] || isNaN(args[0])) return reply("❌ Please provide a valid number of minutes! Example: .settime 5");

      const minutes = parseInt(args[0]);
      if (minutes < 1) return reply("❌ Time interval must be at least 1 minute!");

      timeInterval = minutes * 60000;
      await reply(`✅ Auto-posting interval set to ${minutes} minutes!`);
    } catch (e) {
      console.error("Error in settime command:", e.message);
      await reply(`❌ Error: ${e.message}`);
    }
  }
);

cmd(
  {
    pattern: "clearlinks",
    react: "🤖",
    desc: "Clear all stored TikTok links (owner only)",
    category: "owner",
    filename: __filename,
  },
  async (robin, mek, m, { from, isOwner, reply }) => {
    try {
      if (!isOwner) return reply("❌ This command is for owner only!");
      if (!tiktokLinks.length) return reply("❌ No links to clear!");

      tiktokLinks = [];
      await reply("✅ All TikTok links have been cleared!");
      console.log("TikTok links cleared.");
    } catch (e) {
      console.error("Error in clearlinks command:", e.message);
      await reply(`❌ Error: ${e.message}`);
    }
  }
);
