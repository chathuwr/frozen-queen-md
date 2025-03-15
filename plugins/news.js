const { cmd } = require("../command");
const axios = require("axios"); // Install axios using: npm install axios

// Global variables to manage auto-news
let newsInterval = null;
let autoNewsGroupId = null;
let lastSentNewsTitle = null;

// Hiru News API endpoint
const hiruNewsApi = "https://suhas-bro-api.vercel.app/news/hiru";

cmd(
  {
    pattern: "autonews",
    alias: ["autohirunews"],
    react: "📰",
    desc: "Enable or disable automatic Hiru news updates with FrozenQueen",
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
      const action = args[0]?.toLowerCase();

      if (action === "on") {
        if (newsInterval) {
          return reply("*❌ FrozenQueen Error:* Auto news is already enabled!");
        }

        if (!isGroup) {
          return reply("*❌ FrozenQueen Error:* This command can only be used in a group!");
        }

        autoNewsGroupId = from;
        const savedMek = { ...mek };

        // Fetch and send the latest Hiru news immediately
        const initialNews = await fetchNews(hiruNewsApi);
        if (initialNews) {
          await sendNews(robin, autoNewsGroupId, initialNews, "HIRU", savedMek);
          lastSentNewsTitle = initialNews.title;
        } else {
          reply("*❄️ FrozenQueen Warning:* Failed to fetch initial Hiru news. API may be down. Continuing with updates...");
        }

        // Start checking for new updates every 5 minutes
        newsInterval = setInterval(async () => {
          try {
            const news = await fetchNews(hiruNewsApi);
            if (news) {
              if (news.title !== lastSentNewsTitle) { // Check if it's new
                await sendNews(robin, autoNewsGroupId, news, "HIRU", savedMek);
                lastSentNewsTitle = news.title;
              }
            } else {
              console.log("No new news or API issue detected.");
            }
          } catch (e) {
            console.error("FrozenQueen Auto-news check error:", e);
          }
        }, 300000); // 5 minutes (300000 ms)

        return reply(
          "*✅ FrozenQueen Auto News Enabled!* ❄️\n" +
          "- Latest Hiru news sent (if available).\n" +
          "- Checking for updates every 5 minutes."
        );
      } else if (action === "off") {
        if (!newsInterval) {
          return reply("*❌ FrozenQueen Error:* Auto news is not enabled!");
        }

        clearInterval(newsInterval);
        newsInterval = null;
        autoNewsGroupId = null;
        lastSentNewsTitle = null;

        return reply("*✅ FrozenQueen Auto News Disabled!* ❄️");
      } else {
        return reply("*❌ FrozenQueen Error:* Invalid action! Use `.autonews on` or `.autonews off`.");
      }
    } catch (e) {
      console.error("FrozenQueen Auto-news error:", e);
      reply(`*❌ FrozenQueen Error:* ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);

// Function to fetch news from the API
async function fetchNews(apiUrl) {
  try {
    const response = await axios.get(apiUrl, { timeout: 10000 }); // 10 seconds timeout

    if (!response.data || !response.data.status || !response.data.result) {
      console.log("FrozenQueen: No news found or invalid response format.");
      return null;
    }

    return response.data.result;
  } catch (e) {
    console.error("FrozenQueen: Failed to fetch news:", e.response ? e.response.status : e.message);
    return null; // Return null instead of throwing error to handle gracefully
  }
}

// Function to send news to the group
async function sendNews(client, groupId, news, source, replyTo) {
  try {
    if (!groupId) {
      console.error("FrozenQueen: No group ID available for sending news");
      return;
    }

    await client.sendMessage(
      groupId,
      {
        image: { url: news.img },
        caption: `
*📰 ${news.title} (${source})* ❄️

📅 *Date:* ${news.date}
📝 *Description:* ${news.desc}

🔗 *Read more:* ${news.link}

*❄️ FrozenQueen Auto News Generated ❄️*
        `,
      },
      { quoted: replyTo }
    );
    console.log(`FrozenQueen: Successfully sent ${source} news to group`);
  } catch (e) {
    console.error("FrozenQueen: Failed to send news:", e);
  }
}
