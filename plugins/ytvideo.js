const { cmd, commands } = require("../command");
const axios = require('axios');
const YouTube = require("youtube-sr").default;

const pendingDownloads = new Map();

// Helper function to extract YouTube ID from URL
const replaceYouTubeID = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

cmd(
  {
    pattern: "video",
    alias: ["ytmp4", "ytmp4dl"],
    react: "❄️",
    desc: "Download YouTube video, document, or audio with quality selection",
    category: "download",
    use: ".video <YT URL or Video Name>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, args, q, reply }
  ) => {
    try {
      if (!q) return await reply("✖️ Please provide a YouTube URL or video name! Ex: `.video lelena` or `.video https://youtube.com/watch?v=abc123`");

      let id, videoUrlInput, thumbnailUrl;

      // Step 1: Identify URL or Search Query
      if (q.startsWith("https://")) {
        id = replaceYouTubeID(q);
        if (!id) return await reply("✖️ Invalid YouTube URL!");
        thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        videoUrlInput = q;
      } else {
        const video = await YouTube.searchOne(q);
        if (!video) return await reply("✖️ No videos found for your query!");
        id = video.id;
        videoUrlInput = video.url;
        thumbnailUrl = video.thumbnail;
      }

      // Step 2: Fetch initial metadata (default 480p)
      const apiUrl = `https://api.fgmods.xyz/api/downloader/ytmp4?url=https://www.youtube.com/watch?v=${id}&quality=480p&apikey=s2SvXgQp`;
      const response = await axios.get(apiUrl);
      const videoData = response.data;

      if (!videoData.status || !videoData.result) {
        return await reply(`✖️ Failed to fetch video! API Error: ${videoData.message || "Unknown error"}`);
      }

      const { title, duration, size } = videoData.result;

      // Step 3: Prompt user for format and quality
      let prompt = `
❅═══════❅═══════❅
   *❄️ FROZEN QUEEN ❄️*
   *✨ DOWNLOAD PORTAL ✨*
❅═══════❅═══════❅

✦ *Title* ❯ ${title || "Unknown"}
✦ *Duration* ❯ ${duration || "Unknown"}
✦ *Size* ❯ ${size || "Unknown"}

❅═══════❅═══════❅
   *✨ SELECT OPTION ✨*
❅═══════❅═══════❅
1 ❯ Video 360p 🎬
2 ❯ Video 480p 🎬
3 ❯ Document 360p 📜
4 ❯ Document 480p 📜
5 ❯ Audio 🎵

*Reply with number:*
Ex: "1" (360p Video), "3" (360p Document), "5" (Audio)
`;

      const sentMsg = await robin.sendMessage(
        from,
        { image: { url: thumbnailUrl }, caption: prompt },
        { quoted: mek }
      );
      const messageID = sentMsg.key.id;

      await robin.sendMessage(from, { react: { text: "❄️", key: sentMsg.key } });

      // Store data for next step
      pendingDownloads.set(messageID, { id, videoUrlInput, title, from, mek });

      // Step 4: Handle user response
      robin.ev.on("messages.upsert", async (messageUpdate) => {
        const mekInfo = messageUpdate.messages[0];
        if (!mekInfo.message) return;

        const isReplyToSentMsg = mekInfo.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
        if (isReplyToSentMsg && pendingDownloads.has(messageID)) {
          const { id, videoUrlInput, title, from, mek } = pendingDownloads.get(messageID);
          const userReply = mekInfo.message.conversation || mekInfo.message.extendedTextMessage.text;
          const choice = userReply.trim();

          const validOptions = ["1", "2", "3", "4", "5"];
          if (!validOptions.includes(choice)) {
            return await robin.sendMessage(
              from,
              { text: "✖️ Invalid option! Reply with 1, 2, 3, 4, or 5." },
              { quoted: mek }
            );
          }

          const processingMsg = await robin.sendMessage(
            from,
            { text: "❄️ Processing your request..." },
            { quoted: mek }
          );

          // Step 5: Process the choice
          let downloadUrl, apiResponse;

          if (choice === "5") {
            // Audio download using ytmp3 endpoint
            downloadUrl = `https://api.fgmods.xyz/api/downloader/ytmp3?url=https://www.youtube.com/watch?v=${id}&apikey=s2SvXgQp`;
            apiResponse = await axios.get(downloadUrl);
            const audioData = apiResponse.data;

            if (!audioData.status || !audioData.result?.dl_url) {
              return await robin.sendMessage(
                from,
                { text: "✖️ Failed to fetch audio! API Error: " + (audioData.message || "Unknown error"), edit: processingMsg.key }
              );
            }

            // Attempt to download the audio file and handle potential 403
            try {
              const audioResponse = await axios.get(audioData.result.dl_url, { responseType: 'stream' });
              await robin.sendMessage(
                from,
                {
                  audio: { url: audioData.result.dl_url },
                  mimetype: "audio/mp3",
                  fileName: `${title}.mp3`
                },
                { quoted: mek }
              );
              await robin.sendMessage(
                from,
                { text: "✨ Audio Delivered ✨", edit: processingMsg.key }
              );
            } catch (downloadError) {
              console.log("Audio Download Error:", downloadError.response?.status, downloadError.response?.statusText);
              await robin.sendMessage(
                from,
                { text: "✖️ Audio download blocked (403 Forbidden). Try again later or use a different video.", edit: processingMsg.key }
              );
            }
          } else {
            // Video or Document download
            const qualityMap = { "1": "360p", "2": "480p", "3": "360p", "4": "480p" };
            const quality = qualityMap[choice];
            downloadUrl = `https://api.fgmods.xyz/api/downloader/ytmp4?url=https://www.youtube.com/watch?v=${id}&quality=${quality}&apikey=s2SvXgQp`;
            apiResponse = await axios.get(downloadUrl);
            const downloadData = apiResponse.data;

            if (!downloadData.status || !downloadData.result?.dl_url) {
              return await robin.sendMessage(
                from,
                { text: `✖️ Failed to fetch ${quality} content!`, edit: processingMsg.key }
              );
            }

            const finalDlUrl = downloadData.result.dl_url;

            if (choice === "1" || choice === "2") {
              // Video format
              await robin.sendMessage(
                from,
                { video: { url: finalDlUrl }, mimetype: "video/mp4", thumbnail: { url: thumbnailUrl } },
                { quoted: mek }
              );
              await robin.sendMessage(
                from,
                { text: `✨ ${quality} Video Delivered ✨`, edit: processingMsg.key }
              );
            } else if (choice === "3" || choice === "4") {
              // Document format
              await robin.sendMessage(
                from,
                {
                  document: { url: finalDlUrl },
                  mimetype: "video/mp4",
                  fileName: `${title}.mp4`,
                  caption: "❄️ Frozen Queen ❄️",
                  thumbnail: { url: thumbnailUrl }
                },
                { quoted: mek }
              );
              await robin.sendMessage(
                from,
                { text: `✨ ${quality} Document Delivered ✨`, edit: processingMsg.key }
              );
            }
          }

          // Cleanup
          pendingDownloads.delete(messageID);
          await robin.sendMessage(from, { text: "❄️ Enchanted by Frozen Queen ❄️" }, { quoted: mek });
        }
      });
    } catch (e) {
      console.log("Error:", e);
      await robin.sendMessage(from, { react: { text: "✖️", key: mek.key } });
      await reply(`✖️ Error: ${e.message || "Something went wrong!"}`);
    }
  }
);
