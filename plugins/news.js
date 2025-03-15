const { cmd } = require("../command");
const axios = require("axios"); // Install axios using: npm install axios

// Global variables to manage auto-news
let hiruDeranaInterval = null; // Interval for Hiru and Derana (every 30 minutes)
let otherPlatformsInterval = null; // Interval for other platforms (every 1 hour)
let autoNewsGroupId = null;

// Supported news sources and their API endpoints
const newsSources = {
  hiru: "https://suhas-bro-api.vercel.app/news/hiru",
  derana: "https://suhas-bro-api.vercel.app/news/derana",
  sirasa: "https://suhas-bro-api.vercel.app/news/sirasa",
  lankadeepa: "https://suhas-bro-api.vercel.app/news/lankadeepa",
  itn: "https://suhas-bro-api.vercel.app/news/itn",
  siyatha: "https://suhas-bro-api.vercel.app/news/siyatha",
};

cmd(
  {
    pattern: "autonews",
    alias: ["autohirunews"],
    react: "📰",
    desc: "Enable or disable automatic news updates",
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
        // Enable auto-news
        if (hiruDeranaInterval || otherPlatformsInterval) {
          return reply("*❌ Auto news is already enabled!*");
        }

        if (!isGroup) {
          return reply("*❌ This command can only be used in a group!*");
        }

        // Store the group ID
        autoNewsGroupId = from;

        // Start the interval for Hiru and Derana (every 30 minutes)
        hiruDeranaInterval = setInterval(async () => {
          try {
            // Fetch and send Hiru news
            const hiruNews = await fetchNews(newsSources.hiru);
            if (hiruNews) {
              await sendNews(hiruNews, "HIRU");
            }

            // Fetch and send Derana news
            const deranaNews = await fetchNews(newsSources.derana);
            if (deranaNews) {
              await sendNews(deranaNews, "DERANA");
            }
          } catch (e) {
            console.error("Hiru/Derana auto-news error:", e);
          }
        }, 1800000); // 30 minutes interval (1800000 ms)

        // Start the interval for other platforms (every 1 hour)
        otherPlatformsInterval = setInterval(async () => {
          try {
            // Fetch and send news from other platforms
            const platforms = ["sirasa", "lankadeepa", "itn", "siyatha"];
            for (const platform of platforms) {
              const news = await fetchNews(newsSources[platform]);
              if (news) {
                await sendNews(news, platform.toUpperCase());
              }
            }
          } catch (e) {
            console.error("Other platforms auto-news error:", e);
          }
        }, 3600000); // 1 hour interval (3600000 ms)

        return reply(
          "*✅ Auto news enabled!*\n" +
          "- Hiru and Derana news will be sent every 30 minutes.\n" +
          "- Other platforms (Sirasa, Lankadeepa, ITN, Siyatha) news will be sent every hour."
        );
      } else if (action === "off") {
        // Disable auto-news
        if (!hiruDeranaInterval && !otherPlatformsInterval) {
          return reply("*❌ Auto news is not enabled!*");
        }

        clearInterval(hiruDeranaInterval);
        clearInterval(otherPlatformsInterval);
        hiruDeranaInterval = null;
        otherPlatformsInterval = null;
        autoNewsGroupId = null;

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
      throw new Error("No news found.");
    }

    return response.data.result;
  } catch (e) {
    console.error("Failed to fetch news:", e);
    return null;
  }
}

// Function to send news to the group
async function sendNews(news, source) {
  try {
    await robin.sendMessage(
      autoNewsGroupId,
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
      { quoted: mek }
    );
  } catch (e) {
    console.error("Failed to send news:", e);
  }
}
