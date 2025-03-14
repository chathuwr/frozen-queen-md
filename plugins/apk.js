cmd(
  {
    pattern: "apk",
    react: "📂",
    desc: "Download APK File",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, q, reply }
  ) => {
    try {
      // Check if an app ID or URL is provided
      if (!q) return reply("Ex: `.apk com.example.app` or `.apk [app name]`");

      const appId = q.trim();
      
      // API configuration (replace with your APK download API)
      const API_URL = `https://api.example.com/apk?app=${encodeURIComponent(appId)}`;

      // Notify user of progress
      const processingMsg = await reply("📂 *Processing APK Download...*");

      // Fetch APK info from API
      const response = await fetch(API_URL);
      const result = await response.json();

      // Check if the response is valid
      if (result.code !== 0 || !result.data || !result.data.downloadUrl) {
        return reply("❌ Error: Couldn't fetch APK. Check the app ID or API status.");
      }

      const apkUrl = result.data.downloadUrl;
      const appName = result.data.name || "Unknown App";
      const version = result.data.version || "Unknown";
      const size = result.data.size || "Unknown";

      // Create a formatted caption
      const caption = `*❄️ Frozen Queen APK Downloader ❄️*\n\n` +
        `📱 *App*: ${appName}\n` +
        `🔢 *Version*: ${version}\n` +
        `📦 *Size*: ${size}\n` +
        `🔗 *Download URL*: [Click here to download](${apkUrl})\n\n` +
        `*Made with 💙 by Frozen Queen Team*`;

      // Send the APK download link with the caption
      const apkMsg = await robin.sendMessage(
        from,
        {
          document: { url: apkUrl },
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${appName}.apk`,
          caption: caption
        },
        { quoted: mek }
      );

      // Try to add a reaction to the APK message
      try {
        if (apkMsg && apkMsg.key) {
          await robin.sendMessage(from, { react: { text: "📂", key: apkMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }
    } catch (e) {
      console.error("Error in APK download:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

// Let me know if you want me to fine-tune this! 🚀
