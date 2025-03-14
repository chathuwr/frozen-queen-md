const { cmd } = require("../command");

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
      // Dynamically import node-fetch
      const fetch = (await import("node-fetch")).default;

      // Check if an app ID or URL is provided
      if (!q) return reply("Example: `.apk com.example.app` or `.apk [app name]`");

      const appId = q.trim();

      // API configuration (replace with your APK download API)
      const API_URL = `https://www.dark-yasiya-api.site/download/apk?id=${encodeURIComponent(appId)}`;

      // Notify user of progress
      const processingMsg = await reply("📂 *Processing APK Download...*");

      // Fetch APK info from API
      const response = await fetch(API_URL);
      console.log("API Response:", response); // Debugging

      if (!response.ok) {
        return reply(`❌ API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Result:", result); // Debugging

      // Check if the response is valid
      if (!result || !result.downloadUrl) {
        return reply("❌ Error: Invalid API response. Check the app ID or API status.");
      }

      const apkUrl = result.downloadUrl;
      const appName = result.name || "Unknown App";
      const version = result.version || "Unknown";
      const size = result.size || "Unknown";

      // Create a formatted caption
      const caption = `*❄️ Frozen Queen APK Downloader ❄️*\n\n` +
        `📱 *App*: ${appName}\n` +
        `🔢 *Version*: ${version}\n` +
        `📦 *Size*: ${size}\n` +
        `🔗 *Download URL*: [Click here to download](${apkUrl})\n\n` +
        `*Made with 💙 by Frozen Queen Team*`;

      // Send the APK file with the caption
      const apkMsg = await robin.sendMessage(
        from,
        {
          document: { url: apkUrl },
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
