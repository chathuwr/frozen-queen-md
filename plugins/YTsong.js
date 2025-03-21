const { cmd } = require("../command");
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();
const pendingDownloads = new Map();

const replaceYouTubeID = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

cmd(
  {
    pattern: "song",
    desc: "Download Ytmp3",
    use: ".song <Text or YT URL>",
  },
  async (robin, mek, m, { from, quoted, q, reply }) => {
    try {
      if (!q) return await reply("❌ Query ekak ho URL ekak danna!");

      let id = null;
      if (q.startsWith("https://")) {
        id = replaceYouTubeID(q);
        if (!id) return await reply("❌ Invalid YouTube URL!");
      }

      if (!id) {
        const searchResults = await dy_scrap.ytsearch(q);
        if (!searchResults?.results?.length) return await reply("❌ Results nadda!");
        id = searchResults.results[0].videoId;
      }

      // Background download start karanawa
      const downloadPromise = dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);

      // Metadata gannawa
      const response = await downloadPromise;
      if (!response?.status) return await reply("❌ Video fetch karanna ba!");

      const { url, title, timestamp, image } = response.result.data;

      // Duration check (30 min limit)
      let durationParts = timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];
      if (totalSeconds > 1800) return await reply("⏱️ Audio limit eka 30 minutes!");

      // Metadata message
      let info = `
🎵 *Title:* ${title}
⏳ *Duration:* ${timestamp}
🔽 *Choice:*
1️⃣ Audio
2️⃣ Document
3️⃣ both
`;
      const sentMsg = await robin.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
      const messageID = sentMsg.key.id;

      // Pending download save karanawa
      pendingDownloads.set(messageID, { downloadPromise, data: { title, url }, from, mek });

      // User choice eka gannawa
      robin.ev.on("messages.upsert", async (messageUpdate) => {
        const mekInfo = messageUpdate.messages[0];
        if (!mekInfo.message) return;

        const isReply = mekInfo.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
        if (isReply && pendingDownloads.has(messageID)) {
          const { downloadPromise, data, from, mek } = pendingDownloads.get(messageID);
          const choice = (mekInfo.message.conversation || mekInfo.message.extendedTextMessage.text).trim();

          if (["1", "2", "3"].includes(choice)) {
            const processingMsg = await robin.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
            const songData = await downloadPromise;
            let videoUrl = songData.result.download.url;

            if (choice === "1") {
              await robin.sendMessage(from, { audio: { url: videoUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
              await robin.sendMessage(from, { text: "✅ Audio sent!", edit: processingMsg.key });
            } else if (choice === "2") {
              await robin.sendMessage(
                from,
                { document: { url: videoUrl }, mimetype: "audio/mpeg", fileName: `${data.title}.mp3` },
                { quoted: mek }
              );
              await robin.sendMessage(from, { text: "✅ Document sent!", edit: processingMsg.key });
            } else if (choice === "3") {
              await robin.sendMessage(from, { audio: { url: videoUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
              await robin.sendMessage(
                from,
                { document: { url: videoUrl }, mimetype: "audio/mpeg", fileName: `${data.title}.mp3` },
                { quoted: mek }
              );
              await robin.sendMessage(from, { text: "✅ Deka sent!", edit: processingMsg.key });
            }

            pendingDownloads.delete(messageID);
          } else {
            await robin.sendMessage(from, { text: "❌ 1, 2, ho 3 danna!" }, { quoted: mek });
          }
        }
      });
    } catch (e) {
      await reply(`❌ Error: ${e.message || "Something went wrong!"}`);
    }
  }
);
