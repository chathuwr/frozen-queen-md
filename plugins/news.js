const { cmd } = require("../command");
const axios = require("axios"); // Install axios using: npm install axios

// Global variables to manage auto-news
let newsInterval = null;
let autoNewsGroupId = null;
let lastSentNewsTitle = null; // Store the title of the last sent news

// Hiru News API endpoint
const hiruNewsApi = "https://suhas-bro-api.vercel.app/news/hiru";

cmd(
  {
    pattern: "autonews",
    alias: ["autohirunews"],
    react: "📰",
    desc: "Enable or disable automatic Hiru news updates",
    category: "utility",
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
      const action = args[0]?.toLowerCase(); // Get the action (on/off)

      if (action === "on") {
        if (newsInterval) {
          return reply("*❌ Auto news is already enabled!*");
        }

        if (!isGroup) {
          return reply("*❌ This command can only be used in a group!*");
        }

        autoNewsGroupId = from;
        const savedMek = { ...mek };

        // Fetch and send the latest Hiru news immediately
        const initialNews = await fetchNews(hiruNewsApi);
        if (initialNews) {
          await sendNews(robin, autoNewsGroupId, initialNews, "HIRU", savedMek);
          lastSentNewsTitle = initialNews.title; // Store the title of the sent news
        } else {
          reply("*❌ Failed to fetch initial Hiru news!*");
        }

        // Start checking for new updates every 5 minutes
        newsInterval = setInterval(async () => {
          try {
            const news = await fetchNews(hiruNewsApi);
            if (news && news.title !== lastSentNewsTitle) { // Check if it's a new news item
              await sendNews(robin, autoNewsGroupId, news, "HIRU", savedMek);
              lastSentNewsTitle = news.title; // Update the last sent news title
            }
          } catch (e) {
            console.error("Auto-news check error:", e);
          }
        }, 300000); // 5 minutes (300000 ms)

        return reply(
          "*✅ Auto news enabled for Hiru!*\n" +
          "- Latest news sent immediately.\n" +
          "- New updates will be checked every 5 minutes and sent to this group."
        );
      } else if (action === "off") {
        if (!newsInterval) {
          return reply("*❌ Auto news is not enabled!*");
        }

        clearInterval(newsInterval);
        newsInterval = null;
        autoNewsGroupId = null;
        lastSentNewsTitle = null;

        return reply("*✅ Auto news disabled!*");
      } else {
        return reply("*❌ Invalid action! Use `.autonews on` or `.autonews off`.*");
      }
    } catch (e) {
      console.error(e);
      reply(`*❌ Error:* ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);

// Function to fetch news from the API
async function fetchNews(apiUrl) {
  try {
    const response = await axios.get(apiUrl, { timeout: 10000 }); // 10 seconds timeout

    if (!response.data || !response.data.status || !response.data.result) {
      console.log("No news found or invalid response format.");
      return null;
    }

    return response.data.result;
  } catch (e) {
    console.error("Failed to fetch news:", e);
    return null;
  }
}

// Function to send news to the group
async function sendNews(client, groupId, news, source, replyTo) {
  try {
    if (!groupId) {
      console.error("No group ID available for sending news");
      return;
    }

    await client.sendMessage(
      groupId,
      {
        image: { url: news.img },
        caption: `
*📰 ${news.title} (${source})*

📅 *Date:* ${news.date}
📝 *Description:* ${news.desc}

🔗 *Read more:* ${news.link}

*❄️ Frozen Queen Auto News Generated ❄️*
        `,
      },
      { quoted: replyTo }
    );
    console.log(`Successfully sent ${source} news to group`);
  } catch (e) {
    console.error("Failed to send news:", e);
  }
}
