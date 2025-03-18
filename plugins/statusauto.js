const { cmd } = require("../command");
const TikTokScraper = require("@mtatko/tiktok-scraper");

// Store group-specific data
const groupData = new Map(); // Map to store data per group

cmd({
  pattern: "addlink",
  react: "🤖",
  desc: "Add TikTok links for auto-posting (owner only)",
  category: "owner",
  filename: __filename,
}, async (robin, mek, m, { from, isOwner, args, reply }) => {
  try {
    if (!isOwner) return reply("❌ This command is for owner only!");
    if (!args.length) return reply("❌ Please provide at least one TikTok URL!");

    const rawInput = args.join(" ");
    const tiktokLinks = rawInput
      .split(/\s+/)
      .flatMap(link => link.split(/(?=https:\/\/)/))
      .filter(link => link.match(/^https:\/\/(vt\.tiktok\.com|www\.tiktok\.com)\/.+/))
      .map(link => link.trim());

    if (!tiktokLinks.length) return reply("❌ No valid TikTok URLs provided!");

    // Store links globally for all groups (owner sets universal links)
    groupData.set("globalLinks", tiktokLinks);
    await reply(`✅ Added ${tiktokLinks.length} TikTok links successfully!\nCurrent links: ${tiktokLinks.join(", ")}`);
  } catch (e) {
    console.error("Error in addlink command:", e.message);
    await reply(`❌ Error: ${e.message}`);
  }
});

cmd({
  pattern: "autostatus",
  react: "🤖",
  desc: "Start auto-posting TikTok videos to group",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in a group!");
    const globalLinks = groupData.get("globalLinks") || [];
    if (!globalLinks.length) return reply("❌ No TikTok links available! Owner needs to add links using .addlink");

    if (groupData.has(from) && groupData.get(from).isRunning) {
      return reply("❌ Auto-status is already running in this group! Use .autostatusoff to stop it first.");
    }

    groupData.set(from, {
      isRunning: true,
      timeInterval: 300000, // Default 5 minutes
    });

    await reply(`🤖 Starting auto TikTok posting every ${groupData.get(from).timeInterval / 60000} minutes...`);
    console.log(`Auto-status started for group ${from}`);

    const sendTikTokVideos = async () => {
      while (groupData.get(from)?.isRunning) {
        for (const link of globalLinks) {
          if (!groupData.get(from)?.isRunning) break;
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

            console.log(`Successfully posted video from ${link} to group ${from}`);
          } catch (e) {
            console.error(`Error posting video from ${link} to group ${from}:`, e.message);
          }
          if (groupData.get(from)?.isRunning) {
            await new Promise(resolve => setTimeout(resolve, groupData.get(from).timeInterval));
          }
        }
      }
      console.log(`Auto-status stopped for group ${from}`);
    };

    sendTikTokVideos();
  } catch (e) {
    console.error("Error in autostatus command:", e.message);
    await reply(`❌ Error: ${e.message}`);
    groupData.delete(from); // Clean up on error
  }
});

cmd({
  pattern: "autostatusoff",
  react: "🤖",
  desc: "Stop auto-posting TikTok videos",
  category: "download",
  filename: __filename,
}, async (robin, mek, m, { from, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in a group!");
    if (!groupData.has(from) || !groupData.get(from).isRunning) return reply("❌ Auto-status is not running in this group!");

    groupData.set(from, { ...groupData.get(from), isRunning: false });
    await reply("✅ Auto TikTok posting stopped!");
    console.log(`Auto-status turned off for group ${from}`);
  } catch (e) {
    console.error("Error in autostatusoff command:", e.message);
    await reply(`❌ Error: ${e.message}`);
  }
});

cmd({
  pattern: "settime",
  react: "🤖",
  desc: "Set time interval for auto-posting (in minutes)",
  category: "owner",
  filename: __filename,
}, async (robin, mek, m, { from, isOwner, args, reply }) => {
  try {
    if (!isOwner) return reply("❌ This command is for owner only!");
    if (!args[0] || isNaN(args[0])) return reply("❌ Please provide a valid number of minutes!");

    const minutes = parseInt(args[0]);
    if (minutes < 1) return reply("❌ Time interval must be at least 1 minute!");

    const timeInterval = minutes * 60000;
    if (groupData.has(from)) {
      groupData.set(from, { ...groupData.get(from), timeInterval });
    } else {
      groupData.set(from, { isRunning: false, timeInterval });
    }
    await reply(`✅ Auto-posting interval set to ${minutes} minutes for this group!`);
  } catch (e) {
    console.error("Error in settime command:", e.message);
    await reply(`❌ Error: ${e.message}`);
  }
});

cmd({
  pattern: "clearlinks",
  react: "🤖",
  desc: "Clear all stored TikTok links (owner only)",
  category: "owner",
  filename: __filename,
}, async (robin, mek, m, { from, isOwner, reply }) => {
  try {
    if (!isOwner) return reply("❌ This command is for owner only!");
    if (!groupData.has("globalLinks")) return reply("❌ No links to clear!");

    groupData.delete("globalLinks");
    await reply("✅ All TikTok links have been cleared!");
    console.log("TikTok links cleared.");
  } catch (e) {
    console.error("Error in clearlinks command:", e.message);
    await reply(`❌ Error: ${e.message}`);
  }
});
