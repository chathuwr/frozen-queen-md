const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "fb",
    alias: ["facebook"],
    react: "🎬",
    desc: "Download Facebook Video",
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
      if (!q) return reply("*🎬 Please provide a valid Facebook video URL!* ❄️");

      // Validate the Facebook URL format
      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
      if (!fbRegex.test(q))
        return reply("*❌ Invalid Facebook URL! Please check and try again.* ❄️");

      // Fetch video details using dynamic import
      reply("*⏳ Downloading your video...* ❄️");

      // Dynamically import the fb-downloader-scrapper module
      const { default: getFbVideoInfo } = await import("fb-downloader-scrapper");

      const result = await getFbVideoInfo(q);

      if (!result || (!result.sd && !result.hd)) {
        return reply("*❌ Failed to download video. Please try again later.* 🌚");
      }

      const { title, sd, hd } = result;

      // Prepare and send the message with video details
      let desc = `
*❄️ Frozen Queen FB Downloader ❄️*

🎥 *Title*: ${title || "Unknown"}
🎥 *Quality*: ${hd ? "HD Available" : "SD Only"}

*❄️ Frozen Queen ❄️*
      `;
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true",
          },
          caption: desc,
        },
        { quoted: mek }
      );

      // Send the video if available
      if (hd) {
        await robin.sendMessage(
          from,
          { video: { url: hd }, caption: "*🎬 HD VIDEO 🎬*" },
          { quoted: mek }
        );
        await robin.sendMessage(
          from,
          { video: { url: sd }, caption: "*🎬 SD VIDEO 🎬*" },
          { quoted: mek }
        );
      } else if (sd) {
        await robin.sendMessage(
          from,
          { video: { url: sd }, caption: "*🎬 SD VIDEO 🎬*" },
          { quoted: mek }
        );
      } else {
        return reply("*❌ No downloadable video found!* ❄️");
      }

      return reply("*✅ Thanks for using my bot!* ❄️");
    } catch (e) {
      console.error(e);
      reply(`*❌ Error:* ${e.message || e}`);
    }
  }
);
