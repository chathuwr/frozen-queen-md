const { cmd, commands } = require("../command");
const yts = require("yt-search");
// Replace "" with a valid video download library or API, e.g., a hypothetical "ytmp4"
const { ytmp4 } = require("@vreden/youtube_scraper"); // You’ll need to install or define this

cmd(
  {
    pattern: "video",
    react: "🎥",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("Ex : . ```video funny cat video```  🎥✨");

      // Search for the video on YouTube
      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

      // Video metadata description
      let desc = `
*🎥 Frozen Queen VIDEO DOWNLOADER 🎥*

🎬 *title* : ${data.title}
🎬 *description* : ${data.description}
🎬 *time* : ${data.timestamp}
🎬 *ago* : ${data.ago}
🎬 *views* : ${data.views}
🎬 *url* : ${data.url}

𝐌𝐚𝐝𝐞 𝐛𝐲 FROZEN QUEEN TEAM
`;

      // Send metadata with thumbnail
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Validate video duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ Video limit is 30 minutes");
      }

      // Download the video (assuming ytmp4 or similar library is used)
      const quality = "360p"; // Default quality, adjust as needed
      const videoData = await ytmp4(url, quality); // Replace with actual video download function

      // Send the video file
      await robin.sendMessage(
        from,
        {
          video: { url: videoData.download.url },
          mimetype: "video/mp4",
          caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 FROZEN QUEEN TEAM",
        },
        { quoted: mek }
      );

      return reply("*Thanks for using ❄️Frozen Queen❄️*");
    } catch (e) {
      console.log(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
