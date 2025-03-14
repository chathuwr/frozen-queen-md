const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "apk",
    react: "📂",
    desc: "Download APK File",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      // Check if an app ID or name is provided
      if (!q) return reply("Example: `.apk com.example.app` or `.apk [app name]`");

      const appId = q.trim();

      // API URL
      const API_URL = `https://www.dark-yasiya-api.site/download/apk?id=${encodeURIComponent(appId)}`;

      // Notify user of progress
      const processingMsg = await reply("📂 *Processing APK Download...*");

      // Fetch APK info from API
      const response = await axios.get(API_URL);
      const result = response.data;
      console.log("API Result:", result); // Debugging

      // Check if the response is valid
      if (!result.status || !result.result || !result.result.dl_link) {
        return reply("❌ Error: Couldn't fetch APK. Check the app ID or API status.");
      }

      const downloadUrl = result.result.dl_link;
      const appName = result.result.name || "Unknown App";
      const version = result.result.lastUpdate || "Unknown";
      const size = result.result.size || "Unknown";

      // Create a formatted caption
      const caption = `*❄️ Frozen Queen APK Downloader ❄️*\n\n` +
        `📱 *App*: ${appName}\n` +
        `🔢 *Version*: ${version}\n` +
        `📦 *Size*: ${size}\n` +
        `🔗 *Download URL*: [Click here to download](${downloadUrl})\n\n` +
        `*Made with 💙 by Frozen Queen Team*`;

      // Send the APK file with the caption
      const apkMsg = await robin.sendMessage(
        from,
        {
          document: { url: downloadUrl },
          mimetype: "application/vnd.android.package-archive",
          fileName: `${appName}.apk`,
          caption: caption,
        },
        { quoted: mek }
      );

      // Add a reaction to the APK message
      if (apkMsg && apkMsg.key) {
        await robin.sendMessage(from, { react: { text: "📂", key: apkMsg.key } });
      }

      // Delete the processing message
      await robin.sendMessage(from, { delete: processingMsg.key });

    } catch (e) {
      console.error("Error in APK download:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);
