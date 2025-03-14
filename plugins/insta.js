const { cmd } = require('../command');

cmd(
  {
    pattern: "insta",
    react: "📸",
    desc: "Download Instagram Video or Reel",
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
      // Check if the user provided a URL
      if (!q) return reply("Example: ```.instagram https://www.instagram.com/reel/XYZ123```");
      
      // Extract the Instagram URL from the query
      const reelUrl = q.trim();
      
      // Send initial processing message with logo
      await robin.sendMessage(
        from,
        { 
          image: { url: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true" },
          caption: "❄️ *Processing Instagram Video Download...*\n*Frozen Queen Insta Downloader*"
        },
        { quoted: mek }
      );
      
      // Define the API endpoint and data payload
      const API_URL = "https://bff.listnr.tech/backend/user/getInfoYT";
      const DATA = {
        url: reelUrl,
        platform: "instagram",
        type: "video",
      };
      
      // Fetch video information from the API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify(DATA),
      });
      
      // Check if the response is OK
      if (!response.ok) {
        return reply(`❌ Error: API request failed with status ${response.status}`);
      }
      
      // Parse the API response
      const result = await response.json();
      
      // Extract video URL - handle both response formats
      let videoUrl;
      let title;
      
      if (result.data && result.data.video_url) {
        // First response format
        videoUrl = result.data.video_url;
        title = result.data.title || "Instagram Video";
      } else if (result.url) {
        // Second response format (from the HTML version)
        videoUrl = result.url;
        title = "Instagram Video";
      } else {
        return reply("❌ Error: Invalid Instagram URL or unable to fetch video.");
      }
      
      // Send the video with a caption and logo
      await robin.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: `*❄️ Frozen Queen INSTAGRAM DOWNLOADER ❄️*\n\n🎥 *Title:* ${title}\n🔗 *URL:* ${reelUrl}\n\n*Made by FROZEN QUEEN TEAM*`,
        },
        { quoted: mek }
      );
      
      // Confirm successful download
      return reply("*Thanks for using ❄️ Frozen Queen ❄️*");
    } catch (e) {
      console.error("Error in insta command:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
